import { IEvent, success, failure } from '../libs/response';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';

export const main = async (event: IEvent) => {
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    const params: DocumentClient.QueryInput = {
        TableName: process.env.ROOM_TABLE,
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
