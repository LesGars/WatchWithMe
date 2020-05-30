import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    Room,
    SyncState,
    Watcher,
    WatcherState,
} from '../../extension/src/types';
import { marshallRoom, unmarshallRoom } from './room-marshalling';
import { updateWatcher } from './watcher-operations';

/**
 * Find a room by ID in DDB
 */
export const findRoomById = async (
    roomId: string,
    tableName: string,
    dynamoDb: DocumentClient,
): Promise<Room | undefined> => {
    const params: DocumentClient.GetItemInput = {
        TableName: tableName,
        Key: { roomId },
    };
    try {
        console.debug(`Trying to find room ${roomId}`);
        const data = await dynamoDb.get(params).promise();
        if (data.Item) {
            return unmarshallRoom(data.Item);
        } else {
            console.log(
                `Could not find a room with id ${roomId}. It's either new or destroyed`,
            );
            return undefined;
        }
    } catch (e) {
        console.error('Failed to find or unmarshall room on DDB', e);
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
    dynamoDb: DocumentClient,
): Promise<Room | undefined> => {
    const owner: Watcher = {
        id: ownerConnectionString,
        connectionId: ownerConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: undefined,
        lastHeartbeat: new Date(),
        currentVideoStatus: WatcherState.UNKNOWN,
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
        videoStatus: SyncState.WAITING,
        resumePlayingAt: undefined,
        resumePlayingTimestamp: undefined,
    };
    const params: DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: marshallRoom(room),
    };
    try {
        await dynamoDb.put(params).promise();
        return room;
    } catch (e) {
        console.error('Failed to create a room on DDB', e);
        return undefined;
    }
};

/**
 * Currently, this updateRoom function is only used in tests
 * Feel free to add more complexity here (cf updateRoom related to sync state & commands, etc)
 */
export const updateRoom = async (
    room: Room,
    tableName: string,
    dynamoDb: DocumentClient,
): Promise<Room | undefined> => {
    // If we need more speed improvements, we could work on a partial marshalling of the room
    const roomForDDB = marshallRoom(room);
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: { roomId: room.roomId },
        UpdateExpression: [
            'SET currentVideoUrl = :currentVideoUrl',
            'videoStatus = :videoStatus',
        ].join(','),
        ExpressionAttributeValues: {
            ':currentVideoUrl': roomForDDB.currentVideoUrl,
            ':videoStatus': roomForDDB.videoStatus,
        },
    };
    try {
        await dynamoDb.update(params).promise();
        return room;
    } catch (e) {
        console.error('Failed to join existing room', e);
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
    dynamoDb: DocumentClient,
): Promise<Room | undefined> => {
    const newWatcher: Watcher = {
        id: watcherConnectionString,
        connectionId: watcherConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: undefined,
        lastHeartbeat: new Date(),
        currentVideoStatus: WatcherState.UNKNOWN,
        initialSync: false,
        userAgent: 'TODO',
    };
    return updateWatcher(room, tableName, newWatcher, dynamoDb);
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
