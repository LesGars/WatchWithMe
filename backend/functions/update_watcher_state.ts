import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { UpdateWatcherState } from '../../extension/src/communications/from-extension-to-server';
import { Room } from '../../extension/src/types';
import { dynamoDB } from '../libs/dynamodb-utils';
import { IEvent, success } from '../libs/response';
import { ensureRoomJoined, findRoomById } from '../libs/room-operations';
import { updateWatcherVideoStatus } from '../libs/watcher-operations';

const findAndEnsureRoomJoined = async (
    roomId: string,
    watcherConnectionString: string,
    dynamoDB: DocumentClient,
): Promise<Room> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    if (!roomId) {
        console.log(
            '[WS-S] Could not find an existing roomId in the join room request',
        );
        throw new Error('A room ID must be provided');
    }
    const room = await findRoomById(roomId, process.env.ROOM_TABLE, dynamoDB);
    if (!room) {
        console.log('[WS-S] Could not find room ', roomId);
        throw new Error('Room ${roomId} does not exist and cannot be joined');
    }
    ensureRoomJoined(room, watcherConnectionString);
    return room;
};

export const main = async (event: IEvent) => {
    const mediaEvent = JSON.parse(event.body) as UpdateWatcherState;
    const { roomId, playerEvent } = mediaEvent;
    const watcherId = event.requestContext.connectionId;

    const room = await findAndEnsureRoomJoined(roomId, watcherId, dynamoDB);

    await updateWatcherVideoStatus(
        room,
        process.env.ROOM_TABLE!,
        watcherId,
        mediaEvent.playerEvent,
        dynamoDB,
    );

    console.log(
        `[WS-S] User ${watcherId} media event ${playerEvent.mediaEventType} was successfully processed`,
    );

    // TODO: Schedule play sync if all players are ready ()
    // TODO: notify other watchers of this watcher status (https://github.com/LesGars/WatchWithMe/issues/59)
    // TODO: ask other watchers to seek (https://github.com/LesGars/WatchWithMe/issues/61)
    return success();
};
