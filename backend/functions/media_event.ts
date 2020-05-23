import { failure, IEvent, success } from '../libs/response';
import { findRoomById } from '../libs/room-operations';
import { updateWatcherVideoStatus } from '../libs/watcher-operations';
import { MediaEventForServer } from './../../extension/src/types';

export const main = async (event: IEvent) => {
    if (!process.env.MEDIA_EVENT_BUS) {
        throw new Error('env.MEDIA_EVENT_BUS must be defined');
    }
    if (!process.env.ROOM_TABLE) {
        throw new Error('env.ROOM_TABLE must be defined');
    }

    const mediaEvent = JSON.parse(event.body) as MediaEventForServer;
    const { roomId, playerEvent } = mediaEvent;

    if (!roomId) {
        console.log(
            '[WS-S] Could not find an existing roomId in the join room request',
        );
        return failure();
    }

    const watcherConnectionString = event.requestContext.connectionId;

    const room = await findRoomById(roomId, process.env.ROOM_TABLE);

    if (!room) {
        console.log('[WS-S] Could not find room =_=');
        return failure();
    }
    if (!room.watchers[watcherConnectionString]) {
        console.log(
            '[WS-S] A media event was received for someone ho has not joined the room. Dropping',
        );
        return failure();
    }

    await updateWatcherVideoStatus(
        room,
        process.env.ROOM_TABLE,
        watcherConnectionString,
        mediaEvent.playerEvent,
    );

    console.log(
        `[WS-S] User ${watcherConnectionString} media event ${playerEvent.mediaEventType} was successfully processed`,
    );

    // TODO: Schedule play sync if all players are ready ()
    // TODO: notify other watchers of this watcher status (https://github.com/LesGars/WatchWithMe/issues/59)
    // TODO: ask other watchers to seek (https://github.com/LesGars/WatchWithMe/issues/61)
    return success();
};
