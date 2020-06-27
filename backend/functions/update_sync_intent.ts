import { UpdateSyncIntent } from '../../extension/src/communications/from-extension-to-server';
import { failure, IEvent, success } from '../libs/response';
import { findRoomById, updateRoomSyncIntent } from '../libs/room-operations';
import { ensureRoomJoined } from '../libs/room-utils';
import { scheduleSyncPlayIfPossible } from '../libs/sync-commands';

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

    await scheduleSyncPlayIfPossible(room, event);
    // TODO: notify other watchers of this watcher status (https://github.com/LesGars/WatchWithMe/issues/59)
    // TODO: ask other watchers to seek (https://github.com/LesGars/WatchWithMe/issues/61)
    return success();
};
