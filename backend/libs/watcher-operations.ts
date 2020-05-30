import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    Room,
    UserVideoStatus,
    VideoSyncStatus,
    Watcher,
} from '../../extension/src/types';
import {
    MediaEventType,
    PlayerEvent,
} from './../../extension/src/contentscript/player';
import { marshallMap } from './dynamodb-utils';

/**
 * Indicate that any info was received from a given watcher websocket connection
 */
const assignWatcherHeartbeat = (watcher: Watcher): void => {
    watcher.lastHeartbeat = new Date();
};

/**
 * Indicate a watcher has buffered enough video from the expected video timestamp, and could schedule a sync start
 */
const markWatcherAsReady = (watcher: Watcher) => {
    watcher.currentVideoStatus = UserVideoStatus.READY;
};

/* eslint-disable complexity */
/**
 * Compute the new watcher status from his incoming player media event and the current room status
 */
const assignWatcherStatus = (
    watcher: Watcher,
    playerEvent: PlayerEvent,
    room: Room,
): void => {
    watcher.lastVideoTimestamp = new Date(playerEvent.currentTime);
    switch (playerEvent.mediaEventType) {
        // TODO : https://github.com/LesGars/WatchWithMe/issues/116
        // Right now we cannot differenciate "play:readyForSyncStart, play:buffering, play:syncStart"
        // let's assume the current MediaEventType.PLAY means MediaEventType.PLAY:readyForSyncStart
        case MediaEventType.PLAY: {
            /*
          if the room is NOT in PLAYING mode,
            the play event should be intercepted by the extension to wait for sync
          if the room is in PLAYING mode,
            the play event should not be intercepted by the extension
          */
            switch (room.videoStatus) {
                case VideoSyncStatus.PAUSED: {
                    markWatcherAsReady(watcher);
                    break;
                }
                case VideoSyncStatus.WAITING: {
                    markWatcherAsReady(watcher);
                    break;
                }
                case VideoSyncStatus.PLAYING: {
                    watcher.currentVideoStatus = UserVideoStatus.PLAYING;
                    break;
                }
            }
            break;
        }
        case MediaEventType.SEEK:
            // TODO
            break;
        case MediaEventType.PAUSE:
            watcher.currentVideoStatus = UserVideoStatus.BUFFERING;
            break;
    }
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
    assignWatcherStatus(watcher, playerEvent, room);
    return updateWatcher(room, tableName, watcher, dynamoDb);
};
