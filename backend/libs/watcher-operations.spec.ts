import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Room, SyncState, WatcherState } from '../../extension/src/types';
import { unmarshallRoom } from './room-marshalling';
import { createRoom, updateRoom } from './room-operations-crud';
import { joinExistingRoom } from './room-operations-other';
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
const playerPlayingEvent = {
    watcherState: WatcherState.PLAYING,
    ...defaultPlayerEventAttributes,
};
const playerReadyEvent = {
    watcherState: WatcherState.READY,
    ...defaultPlayerEventAttributes,
};
const playerBufferingEvent = {
    watcherState: WatcherState.BUFFERING,
    ...defaultPlayerEventAttributes,
};

// Global variables used across tests
// The room variable is used to easily manipulate the room in test setups
let room: Room;
// Perform all assertions on ddbRoomAfterOperations
let ddbRoomAfterOperations: DocumentClient.AttributeMap;

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

const setupTestRoom = async (status: SyncState) => {
    const roomId = uuidv4();
    room = (await createRoom(roomId, tableName, 'owner', ddb))!;
    room.ownerId = 'owner';
    room.syncState = status;
    room.currentVideoUrl = 'https://www.youtube.com/watch?v=4242';
    await updateRoom(room, tableName, ddb);
    await joinExistingRoom(room, tableName, 'friend', ddb);
    await reloadRoom(); // A reload is required since the room object is passed in intermediate functions
};

describe('#updateWatcher', () => {
    describe('when the room is in a waiting state with two watchers: the owner and a friend, and they send watcherState updates', () => {
        beforeAll(async () => await setupTestRoom(SyncState.WAITING));
        describe('when first receiving a ready state from the owner', () => {
            beforeAll(async () => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerReadyEvent,
                    ddb,
                );
                return await reloadRoom();
            });
            it('updates the owner to the READY state', async () => {
                expect(ddbRoomAfterOperations.watchers['owner']).toMatchObject({
                    connectionId: 'owner',
                    currentVideoStatus: WatcherState.READY,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            it('leaves the friend in the UNKNOWN state', async () => {
                expect(ddbRoomAfterOperations.watchers['friend']).toMatchObject(
                    {
                        connectionId: 'friend',
                        currentVideoStatus: WatcherState.UNKNOWN,
                        id: 'friend',
                        initialSync: false,
                        userAgent: 'TODO',
                    },
                );
            });
            it('leaves the room in a waiting state', () => {
                expect(ddbRoomAfterOperations).toMatchObject({
                    ownerId: 'owner',
                    syncState: SyncState.WAITING,
                });
            });
        });
        describe('when second receiving another ready event from the other watcher', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'friend',
                    playerReadyEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            it('updates the friend to the Ready state', async () => {
                expect(ddbRoomAfterOperations.watchers['friend']).toMatchObject(
                    {
                        connectionId: 'friend',
                        currentVideoStatus: WatcherState.READY,
                        id: 'friend',
                        initialSync: false,
                        userAgent: 'TODO',
                    },
                );
            });
            test.todo(
                'initiates synchronized start https://github.com/LesGars/WatchWithMe/issues/145',
            );
        });
    });

    describe('when the room is in a playing state (synchronized start was initiated previously)', () => {
        beforeAll(async () => await setupTestRoom(SyncState.PLAYING));
        describe('when receiving a playing event from the owner', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerPlayingEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            it('updates the watcher to the PLAYING state', async () => {
                expect(ddbRoomAfterOperations.watchers['owner']).toMatchObject({
                    connectionId: 'owner',
                    currentVideoStatus: WatcherState.PLAYING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
        });
        describe('when receiving a buffering event from the owner', () => {
            beforeAll(async (done) => {
                await updateWatcherVideoStatus(
                    room,
                    tableName,
                    'owner',
                    playerBufferingEvent,
                    ddb,
                );
                await reloadRoom();
                done();
            });
            it('updates the watcher to the BUFFERING state', async () => {
                expect(ddbRoomAfterOperations.watchers['owner']).toMatchObject({
                    connectionId: 'owner',
                    currentVideoStatus: WatcherState.BUFFERING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            test.todo(
                'updates the room status to PAUSED https://github.com/LesGars/WatchWithMe/issues/149',
            );
        });
    });
});
