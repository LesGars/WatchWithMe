import { Room, SyncIntent } from '../../extension/src/types';

export const syncIntentChanges = (
    room: Room,
    syncIntent: SyncIntent,
): boolean => {
    return room.syncIntent !== syncIntent;
};

export const assignRoomIntent = (room: Room, syncIntent: SyncIntent): Room => {
    if (syncIntentChanges(room, syncIntent)) {
        room.syncStartedAt = undefined;
        room.syncStartedTimestamp = undefined;
        room.resumePlayingAt = undefined;
        room.resumePlayingTimestamp = undefined;
    }

    room.syncIntent = syncIntent;
    return room;
};

export const ensureRoomJoined = (
    room: Room,
    watcherConnectionString: string,
) => {
    if (!room.watchers[watcherConnectionString]) {
        console.log(
            '[WS-S] A media event was received for someone ho has not joined the room. Dropping',
        );
        throw new Error(
            `The room was not joined by watcher ${watcherConnectionString}`,
        );
    }
    return room;
};
