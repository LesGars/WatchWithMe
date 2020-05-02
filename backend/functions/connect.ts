import { APIGatewayProxyResult } from 'aws-lambda';
import { IEvent, success } from '../libs/response';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    console.info(`New connection for ${event.requestContext.connectionId}`);

    return success();
};
