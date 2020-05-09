import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    Room,
    UserVideoStatus,
    VideoSyncStatus,
    Watcher,
} from '../../extension/src/types';

/**
 * Find a room by ID in DDB
 */
export const findRoomById = async (
    roomId: string,
    tableName: string,
): Promise<Room | undefined> => {
    const params: DocumentClient.QueryInput = {
        TableName: tableName,
        KeyConditionExpression: 'roomId = :r',
        ExpressionAttributeValues: {
            ':r': { S: roomId },
        },
    };
    try {
        const dynamoDb = new DocumentClient();
        const data = await dynamoDb.query(params).promise();
        if (data.Count! === 1) {
            return unmarshallRoom(data.Items![0]);
        } else {
            console.log(
                `Could not find a room with id ${roomId}. It's either new or destroyed`,
            );
            return undefined;
        }
    } catch (e) {
        console.error(`Failed to find or unmarshall room on DDB ${e}`);
        return undefined;
    }
};

/**
 * Create a new room in DDB
 */
export const createRoom = async (
    roomId: string,
    tableName: string,
    ownerConnectionString: string,
): Promise<Room | undefined> => {
    const owner: Watcher = {
        id: ownerConnectionString,
        connectionId: ownerConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: undefined,
        lastHeartbeat: new Date(),
        currentVideoStatus: UserVideoStatus.UNKNOWN,
        initialSync: false,
        userAgent: 'TODO',
    };
    const room: Room = {
        roomId,
        createdAt: new Date(),
        ownerId: ownerConnectionString,
        watchers: { [ownerConnectionString]: owner },
        minBufferLength: 5,
        videoSpeed: 1,
        currentVideoUrl: undefined,
        syncStartedAt: undefined,
        syncStartedTimestamp: undefined,
        videoStatus: VideoSyncStatus.WAITING,
        resumePlayingAt: null,
        resumePlayingTimestamp: undefined,
    };
    const params: DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: marshallRoom(room),
    };
    try {
        const dynamoDb = new DocumentClient();
        await dynamoDb.put(params).promise();
        return room;
    } catch (e) {
        console.error(`Failed to create a room on DDB ${e}`);
        return undefined;
    }
};

/**
 * Add a new user to the room's "watchers" map
 */
export const joinExistingRoom = async (
    room: Room,
    tableName: string,
    watcherConnectionString: string,
): Promise<Room | undefined> => {
    const newWatcher: Watcher = {
        id: watcherConnectionString,
        connectionId: watcherConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: undefined,
        lastHeartbeat: new Date(),
        currentVideoStatus: UserVideoStatus.UNKNOWN,
        initialSync: false,
        userAgent: '',
    };
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: { roomId: room.roomId },
        UpdateExpression: 'SET #watchers.#loc = :newWatcher',
        ExpressionAttributeNames: {
            '#watcherId': watcherConnectionString,
            '#watchers': 'watchers',
        },
        ExpressionAttributeValues: {
            ':newWatcher': newWatcher,
        },
    };
    try {
        const dynamoDb = new DocumentClient();
        await dynamoDb.update(params).promise();
        return room;
    } catch (e) {
        console.error(`Failed to create a room on DDB ${e}`);
        return undefined;
    }
};

/**
 * RoomForDDB --> Room
 */
const unmarshallRoom = (roomDDB: DocumentClient.AttributeMap): Room => {
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
 * Room --> RoomForDDB
 */
const marshallRoom = (room: Room) => {
    const roomForDDB = marshallMap(room);
    roomForDDB.watchers = marshallWatchers(roomForDDB.watchers);
    return roomForDDB;
};

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
 * Converts a JS object to a compatible DDB format
 */
const marshallMap = (map: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(map).map(([key, value]) => [key, marshallValue(value)]),
    );
};

/**
 * Dates are converted to strings (ISO 8601)
 */
const marshallValue = (value: any): any => {
    if (value instanceof Date) {
        return value.toISOString;
    } else {
        return value;
    }
};
