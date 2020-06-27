import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Room, SyncIntent } from '../../extension/src/types';
import {
    createRoom,
    joinExistingRoom,
    updateRoomSyncIntent,
} from './room-operations';

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

describe('#createRoom', () => {
    const roomId = 'testCreateRoom';

    it('creates a room and adds the owner as a watcher', async () => {
        await createRoom(roomId, tableName, 'owner', ddb);

        const { Item } = await ddb
            .get({
                TableName: tableName,
                Key: { roomId },
            })
            .promise();

        expect(Item).toEqual({
            minBufferLength: 5,
            ownerId: 'owner',
            resumePlayingAt: undefined,
            roomId: roomId,
            videoSpeed: 1,
            syncState: 'WAITING',
            watchers: {
                owner: {
                    connectionId: 'owner',
                    currentVideoStatus: 'UNKNOWN',
                    id: 'owner',
                    initialSync: false,
                    userAgent: 'TODO',
                },
            },
        });
    });
});

describe('#joinExistingRoom', () => {
    let room: Room;
    const roomId = 'testJoinRoom';
    const owner = 'previous-guy';

    beforeAll(async () => {
        const localRoom = await createRoom(roomId, tableName, owner, ddb);
        if (!localRoom) {
            throw new Error('Could not create a room for the test');
        }
        room = localRoom;
    });

    it('adds a friend to the list of watchers', async () => {
        await joinExistingRoom(room, tableName, 'friend', ddb);

        const { Item: roomAfterJoin } = await ddb
            .get({
                TableName: tableName,
                Key: { roomId },
            })
            .promise();

        expect(roomAfterJoin).toEqual({
            minBufferLength: 5,
            ownerId: owner,
            resumePlayingAt: undefined,
            roomId: roomId,
            videoSpeed: 1,
            videoStatus: 'WAITING',
            watchers: {
                [owner]: {
                    connectionId: owner,
                    currentVideoStatus: 'UNKNOWN',
                    id: owner,
                    initialSync: false,
                    userAgent: 'TODO',
                },
                friend: {
                    connectionId: 'friend',
                    currentVideoStatus: 'UNKNOWN',
                    id: 'friend',
                    initialSync: false,
                    userAgent: 'TODO',
                },
            },
        });
    });
});

describe('#updateRoomSyncIntent', () => {
    let room: Room;
    const roomId = 'testJoinRoom';
    const owner = 'previous-guy';

    beforeAll(async () => {
        const localRoom = await createRoom(roomId, tableName, owner, ddb);
        if (!localRoom) {
            throw new Error('Could not create a room for the test');
        }
        room = localRoom;
    });

    describe('with a play syncIntent', () => {
        it('updates the room sync intent', async () => {
            await updateRoomSyncIntent(room, tableName, SyncIntent.PLAY);

            const { Item: roomAfterJoin } = await ddb
                .get({
                    TableName: tableName,
                    Key: { roomId },
                })
                .promise();

            expect(roomAfterJoin).toMatchObject({
                syncIntent: SyncIntent.PLAY,
            });
        });
    });
});
