import {
    IApplicationEventWrapper,
    BroadcastEventType,
    IEvent,
} from './response';
import { Room } from '../../extension/src/types';

export const buildEvent = (
    type: BroadcastEventType,
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
