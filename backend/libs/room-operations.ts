import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    Room,
    UserVideoStatus,
    VideoSyncStatus,
    Watcher,
} from '../../extension/src/types';
import { marshallMap } from './dynamodb-utils';
import { marshallRoom, unmarshallRoom } from './room-marshalling';

/**
 * Find a room by ID in DDB
 */
export const findRoomById = async (
    roomId: string,
    tableName: string,
    dynamoDb: DocumentClient = new DocumentClient(),
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
    dynamoDb: DocumentClient = new DocumentClient(),
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
        await dynamoDb.put(params).promise();
        return room;
    } catch (e) {
        console.error('Failed to create a room on DDB', e);
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
    dynamoDb: DocumentClient = new DocumentClient(),
): Promise<Room | undefined> => {
    const newWatcher: Watcher = {
        id: watcherConnectionString,
        connectionId: watcherConnectionString,
        joinedAt: new Date(),
        lastVideoTimestamp: undefined,
        lastHeartbeat: new Date(),
        currentVideoStatus: UserVideoStatus.UNKNOWN,
        initialSync: false,
        userAgent: 'TODO',
    };
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: { roomId: room.roomId },
        UpdateExpression: 'SET #watchers.#watcherId = :newWatcher',
        ExpressionAttributeNames: {
            '#loc': watcherConnectionString,
            '#watchers': 'watchers',
        },
        ExpressionAttributeValues: {
            ':newWatcher': marshallMap(newWatcher),
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
