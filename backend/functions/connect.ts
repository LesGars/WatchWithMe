import { APIGatewayProxyResult } from 'aws-lambda';
import { IEvent, success } from '../libs/response';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    console.info(`New connection for ${event.requestContext.connectionId}`);

    return success();
};
