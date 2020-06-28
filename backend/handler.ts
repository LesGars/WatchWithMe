import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';
import { IEvent, success } from './libs/response';

export const defaultHandler = async (event: IEvent) => {
    // default function that just echos back the data to the client
    const client = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    await client
        .postToConnection({
            ConnectionId: event.requestContext.connectionId,
            Data: {
                message: event.body,
            },
        })
        .promise();

    return success({ message: event.body });
};
