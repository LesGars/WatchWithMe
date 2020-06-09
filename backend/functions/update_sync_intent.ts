import { UpdateSyncIntent } from '../../extension/src/communications/from-extension-to-server';
import { IEvent, success, failure } from '../libs/response';
import { findRoomById, updateRoomSyncIntent } from '../libs/room-operations';
import { ensureRoomJoined } from '../libs/room-utils';

export const main = async (event: IEvent) => {
    const updateWatcherEvent = JSON.parse(event.body) as UpdateSyncIntent;
    const { roomId, syncIntent } = updateWatcherEvent;
    const watcherId = event.requestContext.connectionId;

    const room = await findRoomById(roomId, watcherId);
    if (!room) {
        console.error(`Cloud not find romm with id ${roomId}`);
        return failure();
    }
    ensureRoomJoined(room, watcherId);

    await updateRoomSyncIntent(
        room,
        process.env.ROOM_TABLE!,
        watcherId,
        syncIntent,
    );

    console.log(
        `[WS-S] User ${watcherId} sync intent ${syncIntent} was successfully processed`,
    );

    // TODO: Schedule play sync if all players are ready ()
    // TODO: notify other watchers of this watcher status (https://github.com/LesGars/WatchWithMe/issues/59)
    // TODO: ask other watchers to seek (https://github.com/LesGars/WatchWithMe/issues/61)
    return success();
};
