import {
    IEvent,
    success,
    failure,
    IApplicationEventWrapper,
    EventType,
} from '../libs/response';
import EventBridge from 'aws-sdk/clients/eventbridge';

/**
 * Initialize outside handler to use function context
 */
const eventBridge = new EventBridge();

export const main = async (event: IEvent) => {
    if (!process.env.MEDIA_EVENT_BUS) {
        throw new Error('env.MEDIA_EVENT_BUS must be defined');
    }

    if (!process.env.EVENT_SOURCE) {
        throw new Error('env.EVENT_SOURCE must be defined');
    }

    try {
        const readEvent: IApplicationEventWrapper = {
            type: EventType.READ,
            requestContext: event.requestContext,
            data: {
                roomId: event.body,
            },
        };

        await eventBridge
            .putEvents({
                Entries: [
                    {
                        Source: process.env.EVENT_SOURCE,
                        EventBusName: process.env.MEDIA_EVENT_BUS,
                        DetailType: 'read',
                        Detail: JSON.stringify(readEvent),
                    },
                ],
            })
            .promise();

        console.log('pushed event');
        return success();
    } catch (e) {
        console.error('error pushing event');
        console.error(e);
        return failure();
    }
};
