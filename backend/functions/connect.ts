import { IEvent, success, failure } from '../libs/response';
import { APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 } from 'uuid';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    const data = {
        test: '....',
    };

    const params: DocumentClient.PutItemInput = {
        TableName: process.env.ROOM_TABLE,
        Item: {
            username: 'anonymous',
            uuid: v4(),
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
