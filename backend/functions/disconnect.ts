import { APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../libs/dynamodb-utils';
import { WatcherDisconnects } from '../../extension/src/communications/from-extension-to-server';
import { IEvent, success } from '../libs/response';
import { findAndEnsureRoomJoined, leaveRoom } from '../libs/room-operations';
import { Room } from '../../extension/src/types';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    const disconnectEvent: WatcherDisconnects = JSON.parse(
        event.body,
    ) as WatcherDisconnects;
    const { roomId } = disconnectEvent;
    const watcherId: string = event.requestContext.connectionId;

    const room: Room = await findAndEnsureRoomJoined(
        roomId,
        watcherId,
        dynamoDB,
    );

    await leaveRoom(room, process.env.ROOM_TABLE!, watcherId, dynamoDB);

    console.log(
        `[WS-S] User ${watcherId} successfully deconnected from room ${roomId}`,
    );

    // TODO log the deletion of the room if there is no watcher

    return success();
};
