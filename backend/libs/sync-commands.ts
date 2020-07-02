import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { MessageFromServerToExtensionType } from '../../extension/src/communications/from-server-to-extension';
import {
    Room,
    SyncIntent,
    SyncState,
    Watcher,
    WatcherState,
} from '../../extension/src/types';
import { dynamoDB } from './dynamodb-utils';
import { sendEvent } from './event-utils';
import { IEvent } from './response';
import { updateRoom } from './room-operations';

export const scheduleSyncPlayIfPossible = async (
    room: Room,
    event: IEvent,
    dynamoDb: DocumentClient = dynamoDB,
): Promise<void> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    if (
        room.syncIntent == SyncIntent.PLAY &&
        areAllWatchersReady(Object.values(room.watchers))
    ) {
        await scheduleSyncPlay(room, dynamoDb);
        await sendSyncPlayCommandToWatchers(room, event);
    }
};

const areAllWatchersReady = (watchers: Watcher[]): boolean =>
    !watchers.find((w: Watcher) => w.currentVideoStatus == WatcherState.READY);

const scheduleSyncPlay = async (
    room: Room,
    dynamoDb: DocumentClient,
): Promise<void> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    room.syncState = SyncState.PLAY_SCHEDULED;
    room.resumePlayingAt = new Date();
    room.resumePlayingTimestamp =
        room.watchers[room.ownerId].lastVideoTimestamp;
    updateRoom(room, process.env.ROOM_TABLE!, dynamoDb);
};

const sendSyncPlayCommandToWatchers = async (
    room: Room,
    event: IEvent,
): Promise<void> => {
    sendEvent(event, room, MessageFromServerToExtensionType.SCHEDULE_PLAY);
    console.log(
        `SyncPlay command dispatched to watchers of room ${room.roomId}`,
    );
};
