import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    Room,
    SyncIntent,
    Watcher,
    WatcherState,
} from '../../extension/src/types';
import { dynamoDB } from './dynamodb-utils';
import { updateRoom } from './room-operations-crud';
import { assignRoomIntent } from './room-utils';
import { updateWatcher } from './watcher-operations';
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
    dynamoDb: DocumentClient = dynamoDB,
): Promise<Room> => {
    room = assignRoomIntent(room, syncIntent);
    console.log('Update the room with the new sync intent');
    return updateRoom(room, tableName, dynamoDb);
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
