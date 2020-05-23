import { failure, IEvent, success, EventType } from '../libs/response';
import {
    createRoom,
    findRoomById,
    joinExistingRoom,
} from '../libs/room-operations';
import EventBridge from 'aws-sdk/clients/eventbridge';
import { buildEvent } from '../libs/event-utuls';
import { Room } from '../../extension/src/types';

/**
 * Initialize outside handler to use function context
 */
const eventBridge = new EventBridge();

const joinRoom = async (
    roomId: string,
    watcherConnectionString: string,
    tableName: string,
) => {
    console.log(
        `[WS-S] User ${watcherConnectionString} attempting to join room ${roomId}`,
    );

    let roomDDB = await findRoomById(roomId, tableName);
    if (roomDDB) {
        // TODO: Make sure this works via WatchWithMe#90
        roomDDB = await joinExistingRoom(
            roomDDB,
            tableName,
            watcherConnectionString,
        );
    } else {
        roomDDB = await createRoom(roomId, tableName, watcherConnectionString);
    }

    return roomDDB;
};

const sendEvent = async (event: IEvent, room: Room) => {
    const roomEvent = buildEvent(EventType.NEW_WATCHER, event, room);
    console.log(roomEvent);
    try {
        await eventBridge
            .putEvents({
                Entries: [roomEvent],
            })
            .promise();
    } catch (e) {
        console.error('Could not send event', e);
    }
};

export const main = async (event: IEvent) => {
    if (!process.env.MEDIA_EVENT_BUS) {
        throw new Error('env.MEDIA_EVENT_BUS must be defined');
    }

    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    const { roomId } = JSON.parse(event.body);
    if (!roomId) {
        console.log(
            '[WS-S] Could not find an existing roomId in the join room request',
        );
        return failure();
    }

    const watcherConnectionString = event.requestContext.connectionId;

    const roomDDB = await joinRoom(
        roomId,
        watcherConnectionString,
        process.env.ROOM_TABLE,
    );

    if (!roomDDB) {
        console.log('[WS-S] Could not join or create a room =_=');
        return failure();
    }

    console.log(
        `[WS-S] User ${watcherConnectionString} joined room ${roomId} successfully`,
    );

    await sendEvent(event, roomDDB);

    // TODO : tell all roomates that someone joined the room
    return success();
};
