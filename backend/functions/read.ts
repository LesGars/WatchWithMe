import { IEvent, success, failure } from '../libs/response';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import * as ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';

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
        const dynamoDb = new DynamoDB.DocumentClient();
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
