import { APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../libs/dynamodb-utils';
import { IEvent, success } from '../libs/response';
import { leaveRoom, findRoomOfWatcher } from '../libs/room-operations';
import { Room } from '../../extension/src/types';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    const watcherId: string = event.requestContext.connectionId;

    const room: Room = await findRoomOfWatcher(
        process.env.ROOM_TABLE!,
        watcherId,
        dynamoDB,
    );

    await leaveRoom(room, process.env.ROOM_TABLE!, watcherId, dynamoDB);

    console.log(
        `[WS-S] User ${watcherId} successfully deconnected from room ${room.roomId}`,
    );

    // TODO log the deletion of the room if there is no watcher

    return success();
};
