import { APIGatewayProxyResult } from 'aws-lambda';
import { MessageFromServerToExtensionType } from '../../extension/src/communications/from-server-to-extension';
import { IEvent, success } from '../libs/response';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    const message = `[WS-S] New connection for ${event.requestContext.connectionId}`;
    console.info(message);

    return success({ message, type: MessageFromServerToExtensionType.SUCCESS });
};
