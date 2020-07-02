import { UpdateSyncIntent } from '../../extension/src/communications/from-extension-to-server';
import { failure, IEvent, success } from '../libs/response';
import {
    ensureOnlyOwnerCanDoThisError,
    findRoomById,
    updateRoomSyncIntent,
} from '../libs/room-operations';
import { ensureRoomJoined } from '../libs/room-utils';
import { scheduleSyncPlayIfPossible } from '../libs/sync-commands';

export const main = async (event: IEvent) => {
    const updateWatcherEvent = JSON.parse(event.body) as UpdateSyncIntent;
    const { roomId, syncIntent } = updateWatcherEvent;
    const watcherId = event.requestContext.connectionId;

    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    const room = await findRoomById(roomId, process.env.ROOM_TABLE);
    if (!room) {
        console.error(`Cloud not find romm with id ${roomId}`);
        return failure();
    }
    ensureOnlyOwnerCanDoThisError(room, watcherId);
    ensureRoomJoined(room, watcherId);

    await updateRoomSyncIntent(room, process.env.ROOM_TABLE, syncIntent);

    console.log(
        `[WS-S] User ${watcherId} sync intent ${syncIntent} was successfully processed`,
    );

    await scheduleSyncPlayIfPossible(room, event);
    // TODO: ask other watchers to seek (https://github.com/LesGars/WatchWithMe/issues/61)
    return success();
};
