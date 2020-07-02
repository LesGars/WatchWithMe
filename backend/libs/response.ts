import { APIGatewayProxyResult, EventBridgeEvent } from 'aws-lambda';
import { MessageFromExtensionToServerType } from '../../extension/src/communications/from-extension-to-server';
import { MessageFromServerToExtensionType } from '../../extension/src/communications/from-server-to-extension';
import { Room } from '../../extension/src/types';

// @ts-ignore
//eslint-disable-next-line @typescript-eslint/no-explicit-any
type AttributeMap = { [key: string]: any };

interface IRequestContext {
    connectionId: string;
    domainName: string;
    stage: string;
    authorizer: {};
}

interface IResponseBody {
    status?: boolean;
    error?: string;
}

type Body = IResponseBody | AttributeMap[] | AttributeMap;

export interface IEvent extends Omit<IAPIGatewayProxyEvent, 'requestContext'> {
    body: string;
    methodArn: string;
    requestContext: IRequestContext;
    pathParameters: {
        id: string;
    };
    source?: string;
}

interface IApplicationEvent {
    roomId: string;
}

export interface IApplicationEventWrapper {
    type: MessageFromServerToExtensionType;
    requestContext: IRequestContext;
    data: Room;
}

export type IEventBridgeEvent = EventBridgeEvent<
    MessageFromServerToExtensionType,
    IApplicationEventWrapper
>;

export interface IAPIGatewayProxyEvent {
    type: MessageFromExtensionToServerType;
    requestContext: IRequestContext;
    data: IApplicationEvent;
}

function buildResponse(statusCode: number, body?: Body): APIGatewayProxyResult {
    return {
        statusCode,
        body: JSON.stringify(body),
    };
}

export const success = async (body?: Body) => {
    return buildResponse(200, body);
};

export const failure = async (body?: Body) => {
    return buildResponse(500, body);
};
