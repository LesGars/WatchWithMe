import { Room, SyncIntent } from '../../extension/src/types';

export const syncIntentChanges = (
    room: Room,
    syncIntent: SyncIntent,
): boolean => {
    return room.syncIntent !== syncIntent;
};

export const assignRoomIntent = (room: Room, syncIntent: SyncIntent): Room => {
    if (syncIntentChanges(room, syncIntent)) {
        console.warn(
            'Sync intent is changed, resetting all sync attributes to null',
        );
        room.syncStartedAt = null;
        room.syncStartedTimestamp = null;
        room.resumePlayingAt = null;
        room.resumePlayingTimestamp = null;
    } else {
        console.warn('Sync intent is Not changed, it is weird');
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
