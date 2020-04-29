import { IEvent, success, failure } from '../libs/response';
import { APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as uuid from 'uuid';

export const main = async (event: IEvent): Promise<APIGatewayProxyResult> => {
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
