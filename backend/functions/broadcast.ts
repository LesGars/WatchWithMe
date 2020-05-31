import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi';
import { BroadcastEvent } from '../../extension/src/types';
import { failure, IEventBridgeEvent, success } from '../libs/response';

/**
 * Initialize outside handler to use function context
 */
let client: ApiGatewayManagementApi;

/**
 * This function will ne called anytime an event is sent to the event bus
 * @param event A wrapper to a EventBus Event
 */
export const main = async (event: IEventBridgeEvent) => {
    console.log('New event has been triggered');
    if (!client) {
        client = new ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: `https://${event.detail.requestContext.domainName}/${event.detail.requestContext.stage}`,
        });
    }

    try {
        const broadcastEvent: BroadcastEvent = {
            type: event.detail.type,
            room: event.detail.data,
        };

        await Promise.all(
            Object.values(event.detail.data.watchers).map((watcher) => {
                return client
                    .postToConnection({
                        ConnectionId: watcher.connectionId,
                        Data: JSON.stringify(broadcastEvent),
                    })
                    .promise();
            }),
        );

        console.info(`[WS-S] Sent data to all watchers`);
        return success();
    } catch (e) {
        console.error(`Failed with ${e}`);
        return failure();
    }
};
