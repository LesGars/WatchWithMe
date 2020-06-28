import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
    MessageFromServerToExtensionType,
    SchedulePlaySyncCommand,
} from '../../extension/src/communications/from-server-to-extension';
import {
    Room,
    SyncIntent,
    syncStartDelayInSeconds,
    SyncState,
    Watcher,
    WatcherState,
} from '../../extension/src/types';
import { dynamoDB } from './dynamodb-utils';
import { sendEvent } from './event-utils';
import { IEvent } from './response';
import { updateRoom } from './room-operations-crud';

const areAllWatchersReady = (watchers: Watcher[]): boolean =>
    !watchers.find((w: Watcher) => w.currentVideoStatus !== WatcherState.READY);

const scheduleSyncPlay = async (
    room: Room,
    dynamoDb: DocumentClient,
): Promise<void> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    room.syncState = SyncState.PLAY_SCHEDULED;
    const resumePlayingAt = new Date();
    resumePlayingAt.setSeconds(
        resumePlayingAt.getSeconds() + syncStartDelayInSeconds,
    );
    room.resumePlayingAt = resumePlayingAt;
    console.log('room owner', room.watchers[room.ownerId]);
    const ownerVideoTimestamp = room.watchers[room.ownerId].lastVideoTimestamp;
    console.log('timestamp to resume playing at', ownerVideoTimestamp);
    room.resumePlayingTimestamp = ownerVideoTimestamp;
    console.log('Updating the room following a scheduleSyncPlay');
    await updateRoom(room, process.env.ROOM_TABLE!, dynamoDb);
};

const sendSyncPlayCommandToWatchers = async (
    room: Room,
    event: IEvent,
): Promise<void> => {
    const message: SchedulePlaySyncCommand = {
        startAt: room.resumePlayingAt!,
        startTimestamp: room.resumePlayingTimestamp!,
        roomId: room.roomId,
        type: MessageFromServerToExtensionType.SCHEDULE_PLAY,
        serverDate: new Date(),
    };
    await sendEvent(event, room, message);
    console.log(
        `SyncPlay command dispatched to watchers of room ${room.roomId}` +
            `start video at timestamp ${room.resumePlayingTimestamp} at ${room.resumePlayingAt}`,
    );
};

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
        console.log('Scheduling sync play since all watchers are ready');
        await scheduleSyncPlay(room, dynamoDb);
        await sendSyncPlayCommandToWatchers(room, event);
    } else {
        console.log(
            'Cannot schedule sync play : watchers not ready or sync intent is not PLAY',
        );
    }
};
