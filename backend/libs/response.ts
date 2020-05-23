import { EventBridgeEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Room, MessageType } from '../../extension/src/types';

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

export enum EventType {
    NEW_WATCHER = 'NEW_WATCHER',
}

interface IApplicationEvent {
    roomId: string;
}

export interface IApplicationEventWrapper {
    type: EventType;
    requestContext: IRequestContext;
    data: Room;
}

export type IEventBridgeEvent = EventBridgeEvent<
    EventType,
    IApplicationEventWrapper
>;

export interface IAPIGatewayProxyEvent {
    type: MessageType;
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
