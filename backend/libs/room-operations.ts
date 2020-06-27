import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    Room,
    SyncIntent,
    SyncState,
    Watcher,
    WatcherState,
} from '../../extension/src/types';
import { dynamoDB } from '../libs/dynamodb-utils';
import { marshallRoom, unmarshallRoom } from './room-marshalling';
import { assignRoomIntent } from './room-utils';
import { updateWatcher } from './watcher-operations';

/**
 * Find a room by ID in DDB
 *
 * Throw an error if the room could not be found
 */
export const findRoomById = async (
    roomId: string,
    tableName: string,
    dynamoDb: DocumentClient = dynamoDB,
): Promise<Room | undefined> => {
    const params: DocumentClient.GetItemInput = {
        TableName: tableName,
        Key: { roomId },
    };
    console.debug(`Trying to find room ${roomId}`);
    let data;
    try {
        data = await dynamoDb.get(params).promise();
    } catch (e) {
        console.error('Failed to find or unmarshall room on DDB', e);
        throw new Error('Failed to find or unmarshall room on DDB');
    }

    if (!data.Item) {
        console.log(
            `Could not find a room with id ${roomId}. It's either new or destroyed`,
        );
        return undefined;
    }

    return unmarshallRoom(data.Item);
};

/**
 * Create a new room in DDB
 */
export const createRoom = async (
    roomId: string,
    tableName: string,
    ownerConnectionString: string,
    dynamoDb: DocumentClient = dynamoDB,
): Promise<Room> => {
    const owner: Watcher = {
        id: ownerConnectionString,
        connectionId: ownerConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: null,
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
        currentVideoUrl: null,
        syncIntent: SyncIntent.PAUSE,
        syncStartedAt: null,
        syncStartedTimestamp: null,
        syncState: SyncState.WAITING,
        resumePlayingAt: null,
        resumePlayingTimestamp: null,
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
        throw new Error('Failed to create room');
    }
};

/**
 * This function will update the room in database based on the values of the input room.
 *
 * If the room could not be updated (eg: the room does not exist) an exception will be thrown
 *
 * @param room The room with the new values
 * @param tableName The table in which to update the room
 * @param dynamoDb An optional dynamoDB Client
 */
export const updateRoom = async (
    room: Room,
    tableName: string,
    dynamoDb: DocumentClient = dynamoDB,
): Promise<Room> => {
    // If we need more speed improvements, we could work on a partial marshalling of the room
    const roomForDDB = marshallRoom(room);
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: { roomId: room.roomId },
        UpdateExpression: [
            'SET currentVideoUrl = :currentVideoUrl',
            'syncIntent = :syncIntent',
            'syncState = :syncState',
            'syncStartedAt = :syncStartedAt',
            'syncStartedTimestamp = :syncStartedTimestamp',
            'resumePlayingAt = :resumePlayingAt',
            'resumePlayingTimestamp = :resumePlayingTimestamp',
        ].join(','),
        ExpressionAttributeValues: {
            ':currentVideoUrl': roomForDDB.currentVideoUrl,
            ':syncIntent': roomForDDB.syncIntent,
            ':syncState': roomForDDB.syncState,
            ':syncStartedAt': roomForDDB.syncStartedAt,
            ':syncStartedTimestamp': roomForDDB.syncStartedTimestamp,
            ':resumePlayingAt': roomForDDB.resumePlayingAt,
            ':resumePlayingTimestamp': roomForDDB.resumePlayingTimestamp,
        },
    };

    console.log('updating room in DDB with new params', params);

    try {
        await dynamoDb.update(params).promise();
        return room;
    } catch (e) {
        console.error('Failed update room', e);
        throw new Error('Failed to update room');
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
): Promise<Room> => {
    const newWatcher: Watcher = {
        id: watcherConnectionString,
        connectionId: watcherConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: null,
        lastHeartbeat: new Date(),
        currentVideoStatus: WatcherState.UNKNOWN,
        initialSync: false,
        userAgent: 'TODO',
    };
    return updateWatcher(room, tableName, newWatcher, dynamoDb);
};

/**
 * Checks the user permission to modify the room the syncIntent
 * Update it
 *
 * @param room The room to update
 * @param tableName The name of the dynamodb table
 * @param watcherConnectionString The connection id of the user trying to update the state
 * @param syncIntent The new syncIntent for the room
 */
export const updateRoomSyncIntent = async (
    room: Room,
    tableName: string,
    syncIntent: SyncIntent,
): Promise<Room> => {
    room = assignRoomIntent(room, syncIntent);
    console.log('Update the room with the new sync intent');
    return updateRoom(room, tableName);
};

export const ensureOnlyOwnerCanDoThisError = (
    room: Room,
    watcher: string,
): void => {
    if (watcher != room.ownerId) {
        throw new Error(
            `Watcher ${watcher} is not authorized to perform this operation, only ${room.ownerId} can`,
        );
    }
};
