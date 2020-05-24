import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Room, VideoSyncStatus } from '../../extension/src/types';
import { MediaEventType } from './../../extension/src/contentscript/player';
import { UserVideoStatus } from './../../extension/src/types';
import { unmarshallRoom } from './room-marshalling';
import { createRoom, joinExistingRoom, updateRoom } from './room-operations';
import { updateWatcherVideoStatus } from './watcher-operations';

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...(isTest && {
        endpoint: 'localhost:8000',
        sslEnabled: false,
        region: 'local-env',
    }),
};
const ddb = new DocumentClient(config);
const tableName = 'watch-with-me-dev-RoomTable';
const defaultPlayerEventAttributes = {
    duration: 42,
    currentTime: 42,
    now: new Date(),
};
const playerPlayEvent = {
    mediaEventType: MediaEventType.PLAY,
    ...defaultPlayerEventAttributes,
};
const playerPauseEvent = {
    mediaEventType: MediaEventType.PLAY,
    ...defaultPlayerEventAttributes,
};
const playerSeekEvent = {
    mediaEventType: MediaEventType.PLAY,
    ...defaultPlayerEventAttributes,
};

// Global variables used across tests
// The room variable is used to easily manipulate the room in test setups
let room: Room;
// Perform all assertions on ddbRoomAfterOperations
let ddbRoomAfterOperations: DocumentClient.AttributeMap;

const setupTestRoom = async (status: VideoSyncStatus) => {
    const roomId = uuidv4();
    room = (await createRoom(roomId, tableName, 'owner', ddb))!;
    room.ownerId = 'owner';
    room.videoStatus = status;
    room.currentVideoUrl = 'https://www.youtube.com/watch?v=4242';
    await updateRoom(room, tableName, ddb);
    await joinExistingRoom(room, tableName, 'friend', ddb);
    await reloadRoom(); // A reload is required since the room object is passed in intermediate functions
};

const reloadRoom = async () => {
    const { Item } = await ddb
        .get({
            TableName: tableName,
            Key: { roomId: room.roomId },
        })
        .promise();
    ddbRoomAfterOperations = Item!;
    room = unmarshallRoom(Item!);
};

describe('#updateWatcher', () => {
    describe('when the room is in a waiting state with two watchers: the owner and a friend, and they send play events', () => {
        beforeAll(async () => await setupTestRoom(VideoSyncStatus.WAITING));
        describe('when first receiving a play event from the owner but the other watcher is not ready', () => {
            beforeAll(async () => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerPlayEvent,
                    ddb,
                );
                return await reloadRoom();
            });
            it('updates the owner to the READY state', async () => {
                expect(ddbRoomAfterOperations.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.READY,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            it('leaves the friend in the UNKNOWN state', async () => {
                expect(ddbRoomAfterOperations.watchers['friend']).toEqual({
                    connectionId: 'friend',
                    currentVideoStatus: UserVideoStatus.UNKNOWN,
                    id: 'friend',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            it('leaves the room in a waiting state', () => {
                expect(ddbRoomAfterOperations).toMatchObject({
                    ownerId: 'owner',
                    videoStatus: VideoSyncStatus.WAITING,
                });
            });
        });
        describe('when second receiving another play event from the other watcher', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'friend',
                    playerPlayEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            it('updates the friend to the Ready state', async () => {
                expect(ddbRoomAfterOperations.watchers['friend']).toEqual({
                    connectionId: 'friend',
                    currentVideoStatus: UserVideoStatus.READY,
                    id: 'friend',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            test.todo(
                'initiates synchronized start https://github.com/LesGars/WatchWithMe/issues/145',
            );
        });
        describe('when third receiving a seek event from the owner', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerSeekEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            test.todo(
                'issues a PAUSE sync command https://github.com/LesGars/WatchWithMe/issues/61',
            );
        });
    });

    describe('when the room is in a playing state (synchronized start was initiated previously)', () => {
        beforeAll(async () => await setupTestRoom(VideoSyncStatus.PLAYING));
        describe('when receiving a play event from the owner', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerPlayEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            it('updates the watcher to the PLAYING state', async () => {
                expect(ddbRoomAfterOperations.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.PLAYING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
        });
        describe('when receiving a pause event from the owner', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerPauseEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            test.todo(
                'updates the owner to the BUFFERING state https://github.com/LesGars/WatchWithMe/issues/149',
            );
            test.todo(
                'updates the room status to PAUSED https://github.com/LesGars/WatchWithMe/issues/149',
            );
        });
        describe('when third receiving a seek event from the owner', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerSeekEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            test.todo(
                'issues a PAUSE sync command https://github.com/LesGars/WatchWithMe/issues/61',
            );
        });
    });
});
