import EventBridge from 'aws-sdk/clients/eventbridge';
import { MessageFromServerToExtensionType } from '../../extension/src/communications/from-server-to-extension';
import { Room } from '../../extension/src/types';
import { IApplicationEventWrapper, IEvent } from './response';

const eventBridge = new EventBridge();

export const buildEvent = (
    type: MessageFromServerToExtensionType,
    originEvent: IEvent,
    room: Room,
) => {
    const readEvent: IApplicationEventWrapper = {
        type: type,
        requestContext: originEvent.requestContext,
        data: room,
    };

    return {
        Source: process.env.EVENT_SOURCE,
        EventBusName: process.env.MEDIA_EVENT_BUS,
        DetailType: type,
        Detail: JSON.stringify(readEvent),
    };
};

export const sendEvent = async (
    event: IEvent,
    room: Room,
    type: MessageFromServerToExtensionType,
) => {
    const roomEvent = buildEvent(type, event, room);
    console.log(roomEvent);
    try {
        await eventBridge
            .putEvents({
                Entries: [roomEvent],
            })
            .promise();
    } catch (e) {
        console.error('Could not send event', e);
    }
};
