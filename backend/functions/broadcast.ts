import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';

import { IEventBridgeEvent, success, failure } from '../libs/response';

/**
 * Initialize outside handler to use function context
 */
const dynamoDb = new DocumentClient();
let client: ApiGatewayManagementApi;

export const main = async (event: IEventBridgeEvent) => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    if (!client) {
        client = new ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: `https://${event.detail.requestContext.domainName}/${event.detail.requestContext.stage}`,
        });
    }

    const params: DocumentClient.QueryInput = {
        TableName: process.env.ROOM_TABLE,
        KeyConditionExpression: 'username = :u',
        ExpressionAttributeValues: {
            ':u': 'anonymous',
        },
    };

    try {
        const data = await dynamoDb.query(params).promise();
        await client
            .postToConnection({
                ConnectionId: event.detail.requestContext.connectionId,
                Data: `found: ${JSON.stringify(data)}`,
            })
            .promise();

        console.info(
            `sent data to ${event.detail.requestContext.connectionId}`,
        );
        return success();
    } catch (e) {
        console.error(`Failed with ${e}`);
        return failure();
    }
};
