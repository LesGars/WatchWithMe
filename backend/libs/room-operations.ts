/* eslint-disable max-lines */
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as _ from 'lodash';
import {
    Room,
    SyncState,
    Watcher,
    WatcherState,
} from '../../extension/src/types';
import { marshallRoom, unmarshallRoom } from './room-marshalling';
import { updateWatcher } from './watcher-operations';

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

export const findRoomOfWatcher = async (
    tableName: string,
    watcherConnectionString: string,
    dynamoDb: DocumentClient,
): Promise<Room> => {
    const params: DocumentClient.QueryInput = {
        TableName: tableName,
    };
    try {
        console.debug(
            `Trying to find room of watcher ${watcherConnectionString}`,
        );
        const data = await dynamoDb.query(params).promise();
        if (data.Items) {
            const roomDDB:
                | DocumentClient.AttributeMap
                | undefined = data.Items.find(
                (r: DocumentClient.AttributeMap) => {
                    const watchers: DocumentClient.AttributeMap = r.watchers;
                    return (
                        Object.keys(watchers).find(
                            (watcherId) =>
                                watcherId === watcherConnectionString,
                        ) !== undefined
                    );
                },
            );

            if (!roomDDB) {
                console.log(
                    `Could not find the room of watcher ${watcherConnectionString}`,
                );
                throw new Error(
                    `Could not find the room of watcher ${watcherConnectionString}`,
                );
            }
            return unmarshallRoom(roomDDB);
        } else {
            console.log('There is no room in the DB');
            throw new Error('There is no room in the DB');
        }
    } catch (e) {
        console.error('Failed to find or unmarshall room on DDB', e);
        throw e;
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

/**
 * Removes a watcher from a room if there are 2 or more watchers
 * If there is only 1 watcher, delete the room after removing the watcher
 */
export const leaveRoom = async (
    room: Room,
    tableName: string,
    watcherConnectionString: string,
    dynamoDb: DocumentClient,
): Promise<Room | undefined> => {
    ensureRoomJoined(room, watcherConnectionString);
    delete room.watchers[watcherConnectionString];

    if (_.isEmpty(room.watchers)) {
        deleteRoom(room, tableName, dynamoDb);
        return undefined;
    }
    return updateRoom(room, tableName, dynamoDb);
};

export const findAndEnsureRoomJoined = async (
    roomId: string,
    watcherConnectionString: string,
    dynamoDB: DocumentClient,
): Promise<Room> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    if (!roomId) {
        console.log(
            '[WS-S] Could not find an existing roomId in the join room request',
        );
        throw new Error('A room ID must be provided');
    }
    const room = await findRoomById(roomId, process.env.ROOM_TABLE, dynamoDB);
    if (!room) {
        console.log('[WS-S] Could not find room ', roomId);
        throw new Error('Room ${roomId} does not exist and cannot be joined');
    }
    ensureRoomJoined(room, watcherConnectionString);
    return room;
};
