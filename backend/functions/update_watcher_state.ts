import { UpdateWatcherState } from '../../extension/src/communications/from-extension-to-server';
import { dynamoDB } from '../libs/dynamodb-utils';
import { IEvent, success } from '../libs/response';
import { findAndEnsureRoomJoined } from '../libs/room-operations';
import { updateWatcherVideoStatus } from '../libs/watcher-operations';

export const main = async (event: IEvent) => {
    const updateWatcherEvent = JSON.parse(event.body) as UpdateWatcherState;
    const { roomId, playerEvent } = updateWatcherEvent;
    const watcherId = event.requestContext.connectionId;

    const room = await findAndEnsureRoomJoined(roomId, watcherId, dynamoDB);

    await updateWatcherVideoStatus(
        room,
        process.env.ROOM_TABLE!,
        watcherId,
        updateWatcherEvent.playerEvent,
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
