import { IEvent, success, failure } from './libs/response';
import { APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import * as ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';
import * as uuid from 'uuid';
export const connect = async (
    event: IEvent,
): Promise<APIGatewayProxyResult> => {
    if (!process.env.TABLE_NAME) {
        throw new Error('env.tableName must be defined');
    }

    const data = {
        test: '....',
    };

    const params: DocumentClient.PutItemInput = {
        TableName: process.env.TABLE_NAME,
        Item: {
            username: 'anonymous',
            uuid: uuid.v4(),
            content: data,
            createdAt: Date.now(),
        },
    };

    try {
        const dynamoDb = new DocumentClient();
        await dynamoDb.put(params).promise();
        console.info(`inserted data for ${event.requestContext.connectionId}`);
        return success();
    } catch (e) {
        console.error(`Failed with ${e}`);
        return failure();
    }
};

export const disconnect = async () => {
    return success();
};

export const defaultHandler = async (event: IEvent) => {
    // default function that just echos back the data to the client
    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    await client
        .postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: `received: ${event.body}`,
        })
        .promise();

    return {
        statusCode: 200,
    };
};

export const read = async (event: IEvent) => {
    if (!process.env.TABLE_NAME) {
        throw new Error('env.tableName must be defined');
    }

    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    const params: DocumentClient.QueryInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'username = :u',
        ExpressionAttributeValues: {
            ':u': 'anonymous',
        },
    };

    try {
        const dynamoDb = new DocumentClient();
        const data = await dynamoDb.query(params).promise();
        await client
            .postToConnection({
                ConnectionId: event.requestContext.connectionId,
                Data: `found: ${JSON.stringify(data)}`,
            })
            .promise();

        console.info(`sent data to ${event.requestContext.connectionId}`);
        return success();
    } catch (e) {
        console.error(`Failed with ${e}`);
        return failure();
    }
};
