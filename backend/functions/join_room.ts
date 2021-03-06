import { MessageFromServerToExtensionType } from '../../extension/src/communications/from-server-to-extension';
import { dynamoDB } from '../libs/dynamodb-utils';
import { sendEvent } from '../libs/event-utils';
import { failure, IEvent, success } from '../libs/response';
import { createRoom, findRoomById } from '../libs/room-operations-crud';
import { joinExistingRoom } from '../libs/room-operations-other';
import { ChangeRoom } from './../../extension/src/communications/from-extension-to-server';

/**
 * Initialize outside handler to use function context
 */

const joinRoom = async (
    roomId: string,
    watcherConnectionString: string,
    tableName: string,
) => {
    console.log(
        `[WS-S] User ${watcherConnectionString} attempting to join room ${roomId}`,
    );

    let roomDDB = await findRoomById(roomId, tableName, dynamoDB);
    if (roomDDB) {
        console.log(
            `[WS-S] Room ${roomId} already exists. Add user to the room`,
        );
        // TODO: Make sure this works via WatchWithMe#90
        roomDDB = await joinExistingRoom(
            roomDDB,
            tableName,
            watcherConnectionString,
            dynamoDB,
        );
    } else {
        roomDDB = await createRoom(
            roomId,
            tableName,
            watcherConnectionString,
            dynamoDB,
        );
    }

    return roomDDB;
};

export const main = async (event: IEvent) => {
    if (!process.env.MEDIA_EVENT_BUS) {
        throw new Error('env.MEDIA_EVENT_BUS must be defined');
    }

    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    const joinRoomEvent = JSON.parse(event.body) as ChangeRoom;
    const { roomId } = joinRoomEvent;
    if (!roomId) {
        console.log(
            '[WS-S] Could not find an existing roomId in the join room request',
        );
        return failure();
    }

    const watcherConnectionString = event.requestContext.connectionId;

    const room = await joinRoom(
        roomId,
        watcherConnectionString,
        process.env.ROOM_TABLE,
    );

    if (!room) {
        console.log('[WS-S] Could not join or create a room =_=');
        return failure();
    }

    const message = `[WS-S] User ${watcherConnectionString} joined room ${roomId} successfully`;
    console.log(message);

    await sendEvent(event, room, {
        type: MessageFromServerToExtensionType.NEW_WATCHER,
        roomId: room.roomId,
        serverDate: new Date(),
    });

    // TODO : tell all roomates that someone joined the room
    return success({ message, type: MessageFromServerToExtensionType.SUCCESS });
};
