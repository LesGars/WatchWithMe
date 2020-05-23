import { failure, IEvent, success } from '../libs/response';
import { findRoomById } from '../libs/room-operations';
import { updateWatcherVideoStatus } from '../libs/watcher-operations';
import { MediaEventForServer, Room } from './../../extension/src/types';

const findAndEnsureRoomJoined = async (
    roomId: string,
    watcherConnectionString: string,
): Promise<Room | undefined> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    if (!roomId) {
        console.log(
            '[WS-S] Could not find an existing roomId in the join room request',
        );
        return undefined;
    }
    const room = await findRoomById(roomId, process.env.ROOM_TABLE);

    if (!room) {
        console.log('[WS-S] Could not find room =_=');
        return undefined;
    }
    if (!room.watchers[watcherConnectionString]) {
        console.log(
            '[WS-S] A media event was received for someone ho has not joined the room. Dropping',
        );
        return undefined;
    }
    return room;
};

export const main = async (event: IEvent) => {
    const mediaEvent = JSON.parse(event.body) as MediaEventForServer;
    const { roomId, playerEvent } = mediaEvent;
    const watcherId = event.requestContext.connectionId;

    const room = await findAndEnsureRoomJoined(roomId, watcherId);
    if (!room) {
        return failure();
    }

    const updatedRoom = await updateWatcherVideoStatus(
        room,
        process.env.ROOM_TABLE!,
        watcherId,
        mediaEvent.playerEvent,
    );
    if (!updatedRoom) {
        return failure();
    }

    console.log(
        `[WS-S] User ${watcherId} media event ${playerEvent.mediaEventType} was successfully processed`,
    );

    // TODO: Schedule play sync if all players are ready ()
    // TODO: notify other watchers of this watcher status (https://github.com/LesGars/WatchWithMe/issues/59)
    // TODO: ask other watchers to seek (https://github.com/LesGars/WatchWithMe/issues/61)
    return success();
};
