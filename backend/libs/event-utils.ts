import EventBridge from 'aws-sdk/clients/eventbridge';
import { MessageFromServerToExtension } from '../../extension/src/communications/from-server-to-extension';
import { Room } from '../../extension/src/types';
import { IApplicationEventWrapper, IEvent } from './response';

const eventBridge = new EventBridge();

export const buildEvent = (
    message: MessageFromServerToExtension,
    room: Room,
    originEvent: IEvent,
) => {
    const readEvent: IApplicationEventWrapper = {
        requestContext: originEvent.requestContext,
        room,
        message,
    };

    return {
        Source: process.env.EVENT_SOURCE,
        EventBusName: process.env.MEDIA_EVENT_BUS,
        DetailType: message.type,
        Detail: JSON.stringify(readEvent),
    };
};

export const sendEvent = async (
    event: IEvent,
    room: Room,
    message: MessageFromServerToExtension,
) => {
    const eventForEventBridge = buildEvent(message, room, event);
    console.log(eventForEventBridge);
    try {
        await eventBridge
            .putEvents({
                Entries: [eventForEventBridge],
            })
            .promise();
    } catch (e) {
        console.error('Could not send event', e);
    }
};
