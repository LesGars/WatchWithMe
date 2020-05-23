import { failure, IEvent, success } from '../libs/response';
import {
    createRoom,
    findRoomById,
    joinExistingRoom,
} from '../libs/room-operations';

export const main = async (event: IEvent) => {
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
    console.log(
        `[WS-S] User ${watcherConnectionString} attempting to join room ${roomId}`,
    );

    let roomDDB = await findRoomById(roomId, process.env.ROOM_TABLE);
    if (roomDDB) {
        // TODO: Make sure this works via WatchWithMe#90
        roomDDB = await joinExistingRoom(
            roomDDB,
            process.env.ROOM_TABLE,
            watcherConnectionString,
        );
    } else {
        roomDDB = await createRoom(
            roomId,
            process.env.ROOM_TABLE,
            watcherConnectionString,
        );
    }

    if (!roomDDB) {
        console.log('[WS-S] Could not join or create a room =_=');
        return failure();
    }

    console.log(
        `[WS-S] User ${event.requestContext.connectionId} joined room ${roomId} successfully`,
    );
    // TODO : tell all roomates that someone joined the room
    return success();
};
