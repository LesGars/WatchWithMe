import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Room, Watcher } from '../../extension/src/types';
import { marshallMap } from './dynamodb-utils';

/* eslint-disable complexity */
/**
 * WatcherFromDDB --> Watcher
 */
const unmarshallWatchers = (
    watchersDDB: DocumentClient.AttributeMap,
): Record<string, Watcher> => {
    return Object.fromEntries(
        Object.entries(watchersDDB).map(([watcherID, watcherDDB]) => [
            watcherID,
            {
                id: watcherDDB.id,
                connectionId: watcherDDB.connectionId,
                joinedAt: new Date(watcherDDB.joinedAt),
                lastVideoTimestamp: watcherDDB.lastVideoTimestamp
                    ? new Date(watcherDDB.lastVideoTimestamp)
                    : undefined,
                lastHeartbeat: new Date(watcherDDB.lastHeartbeat),
                currentVideoStatus: watcherDDB.currentVideoStatus,
                initialSync: watcherDDB.initialSync,
                userAgent: watcherDDB.userAgent,
            },
        ]),
    );
};

/**
 * RoomForDDB --> Room
 */
export const unmarshallRoom = (roomDDB: DocumentClient.AttributeMap): Room => {
    const room: Room = {
        roomId: roomDDB.roomId || 'error',
        createdAt: new Date(roomDDB.createdAt),
        ownerId: roomDDB.ownerConnectionString,
        watchers: unmarshallWatchers(roomDDB.watchers),
        minBufferLength: roomDDB.minBufferLength,
        videoSpeed: roomDDB.videoSpeed,
        currentVideoUrl: roomDDB.currentVideoUrl,
        syncStartedAt: roomDDB.syncStartedAt
            ? new Date(roomDDB.syncStartedAt)
            : undefined,
        syncStartedTimestamp: roomDDB.syncStartedTimestamp
            ? new Date(roomDDB.syncStartedTimestamp)
            : undefined,
        videoStatus: roomDDB.videoStatus.WAITING,
        resumePlayingAt: roomDDB.resumePlayingAt
            ? new Date(roomDDB.resumePlayingAt)
            : null,
        resumePlayingTimestamp: roomDDB.resumePlayingTimestamp
            ? new Date(roomDDB.resumePlayingTimestamp)
            : undefined,
    };
    // TODO : check casting was good / we do not have out of date DDB items
    return room;
};
/* eslint-enable complexity */

/**
 * watchers --> watchersForDDB
 */
const marshallWatchers = (watchers: Record<string, Watcher>) => {
    return Object.fromEntries(
        Object.entries(watchers).map(([watcherID, watcherDDB]) => [
            watcherID,
            marshallMap(watcherDDB),
        ]),
    );
};

/**
 * Room --> RoomForDDB
 */
export const marshallRoom = (room: Room) => {
    const roomForDDB = marshallMap(room);
    roomForDDB.watchers = marshallWatchers(roomForDDB.watchers);
    return roomForDDB;
};
