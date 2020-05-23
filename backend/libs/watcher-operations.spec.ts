import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Room, VideoSyncStatus } from '../../extension/src/types';
import {
    MediaEventType,
    PlayerEvent,
} from './../../extension/src/contentscript/player';
import { UserVideoStatus } from './../../extension/src/types';
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

let roomId: string;
let room: Room | undefined = undefined;
let playerEvent: PlayerEvent;
let ddbRoom: DocumentClient.AttributeMap | undefined = undefined;

const getDDBRoom = async () => {
    const { Item: item } = await ddb
        .get({
            TableName: tableName,
            Key: { roomId },
        })
        .promise();
    if (!item) {
        throw new Error('Error retrieving DDB room');
    }
    ddbRoom = item;
};

describe('#updateWatcher', () => {
    beforeEach(async (done) => {
        roomId = uuidv4();
        const testRoom = await createRoom(roomId, tableName, 'owner', ddb);
        if (!testRoom) {
            throw new Error('Could not setup test');
        }
        room = testRoom;
        done();
    });
    afterEach(() => {
        ddbRoom = undefined;
        room = undefined;
    });

    describe('when the room is in a waiting state with two watchers: the owner and a friend', () => {
        beforeEach(async (done) => {
            room!.videoStatus = VideoSyncStatus.WAITING;
            room!.currentVideoUrl = 'https://www.youtube.com/watch?v=4242';
            await updateRoom(room!, tableName, ddb);
            await joinExistingRoom(room!, tableName, 'friend', ddb);
            done();
        });
        describe('when receiving a play event from the owner but the other watcher is not ready', () => {
            beforeEach(async (done) => {
                playerEvent = {
                    mediaEventType: MediaEventType.PLAY,
                    duration: 42,
                    currentTime: 42,
                    now: new Date(),
                };
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'owner',
                    playerEvent,
                    ddb,
                );
                await getDDBRoom();
                done();
            });
            it('updates the owner to the Ready state', async () => {
                expect(ddbRoom!.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.READY,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            it('leaves the room in a waiting state', () => {
                expect(ddbRoom!).toMatchObject({
                    ownerId: 'owner',
                    videoStatus: VideoSyncStatus.WAITING,
                });
            });
        });
        describe('when receiving a play event from all watchers', () => {
            beforeEach(async (done) => {
                playerEvent = {
                    mediaEventType: MediaEventType.PLAY,
                    duration: 42,
                    currentTime: 42,
                    now: new Date(),
                };
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'owner',
                    playerEvent,
                    ddb,
                );
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'friend',
                    playerEvent,
                    ddb,
                );
                await getDDBRoom();
                done();
            });
            test.todo(
                'initiates synchronized start https://github.com/LesGars/WatchWithMe/issues/145',
            );
        });
        describe('when receiving a seek event from the owner', () => {
            beforeEach(async (done) => {
                playerEvent = {
                    mediaEventType: MediaEventType.SEEK,
                    duration: 42,
                    currentTime: 48,
                    now: new Date(),
                };
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'owner',
                    playerEvent,
                    ddb,
                );
                await getDDBRoom();
                done();
            });
            it('updates the owner to the BUFFERING state', async () => {
                expect(ddbRoom!.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.BUFFERING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            test.todo(
                'update room status for https://github.com/LesGars/WatchWithMe/issues/61',
            );
        });
    });

    describe('when the room is in a playing state (synchronized start was initiated previously)', () => {
        beforeEach(async (done) => {
            room!.videoStatus = VideoSyncStatus.PLAYING;
            room!.currentVideoUrl = 'https://www.youtube.com/watch?v=4242';
            await updateRoom(room!, tableName, ddb);
            done();
        });
        describe('when receiving a play event from the owner', () => {
            beforeEach(async (done) => {
                playerEvent = {
                    mediaEventType: MediaEventType.PLAY,
                    duration: 42,
                    currentTime: 42,
                    now: new Date(),
                };
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'owner',
                    playerEvent,
                    ddb,
                );
                done();
            });
            it('updates the watcher to the PLAYING state', async () => {
                const { Item } = await ddb
                    .get({
                        TableName: tableName,
                        Key: { roomId },
                    })
                    .promise();
                if (!Item) {
                    throw new Error('Error retrieving DDB room');
                }

                expect(Item.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.PLAYING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
        });
        describe('when receiving a pause event from the owner', () => {
            beforeEach(async (done) => {
                playerEvent = {
                    mediaEventType: MediaEventType.PAUSE,
                    duration: 42,
                    currentTime: 42,
                    now: new Date(),
                };
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'owner',
                    playerEvent,
                    ddb,
                );
                done();
            });
            it('updates the watcher to the BUFFERING state', async () => {
                const { Item } = await ddb
                    .get({
                        TableName: tableName,
                        Key: { roomId },
                    })
                    .promise();
                if (!Item) {
                    throw new Error('Error retrieving DDB room');
                }

                expect(Item.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.BUFFERING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            test.todo('updates the room status to PAUSED');
        });
        describe('when receiving a seek event from the owner', () => {
            beforeEach(async (done) => {
                playerEvent = {
                    mediaEventType: MediaEventType.SEEK,
                    duration: 42,
                    currentTime: 48,
                    now: new Date(),
                };
                await updateWatcherVideoStatus(
                    room!,
                    tableName,
                    'owner',
                    playerEvent,
                    ddb,
                );
                await getDDBRoom();
                done();
            });
            it('updates the owner to the BUFFERING state', async () => {
                expect(ddbRoom!.watchers['owner']).toEqual({
                    connectionId: 'owner',
                    currentVideoStatus: UserVideoStatus.BUFFERING,
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                });
            });
            test.todo(
                'update room status for https://github.com/LesGars/WatchWithMe/issues/61',
            );
        });
    });
});
