import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PlayerEvent } from '../../extension/src/communications/from-extension-to-server';
import { Room, Watcher } from '../../extension/src/types';
import { marshallMap } from './dynamodb-utils';

/**
 * Indicate that any info was received from a given watcher websocket connection
 */
const assignWatcherHeartbeat = (watcher: Watcher): void => {
    watcher.lastHeartbeat = new Date();
};

/* eslint-disable complexity */
/**
 * Compute the new watcher status from his incoming player media event and the current room status
 */
const assignWatcherStatus = (
    watcher: Watcher,
    playerEvent: PlayerEvent,
): void => {
    watcher.lastVideoTimestamp = playerEvent.currentTime;
    watcher.currentVideoStatus = playerEvent.watcherState;
};
/* eslint-enable complexity */

export const updateWatcher = async (
    room: Room,
    tableName: string,
    watcher: Watcher,
    dynamoDb: DocumentClient,
): Promise<Room> => {
    const params: DocumentClient.UpdateItemInput = {
        TableName: tableName,
        Key: { roomId: room.roomId },
        UpdateExpression: 'SET #watchers.#watcherId = :updatedWatcher',
        ExpressionAttributeNames: {
            '#watcherId': watcher.id,
            '#watchers': 'watchers',
        },
        ExpressionAttributeValues: {
            ':updatedWatcher': marshallMap(watcher),
        },
    };
    try {
        await dynamoDb.update(params).promise();
        return room;
    } catch (e) {
        console.error('Failed to update watcher', e);
        throw new Error(
            `Failed to update watcher ${watcher.id} in room ${room.roomId}`,
        );
    }
};

/**
 * Add a new user to the room's "watchers" map
 */
export const updateWatcherVideoStatus = async (
    room: Room,
    tableName: string,
    watcherConnectionString: string,
    playerEvent: PlayerEvent,
    dynamoDb: DocumentClient = new DocumentClient(),
): Promise<Room> => {
    const watcher = room.watchers[watcherConnectionString];
    assignWatcherHeartbeat(watcher);
    assignWatcherStatus(watcher, playerEvent);
    return updateWatcher(room, tableName, watcher, dynamoDb);
};
