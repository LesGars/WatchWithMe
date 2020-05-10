import { Runtime } from "webextension-polyfill-ts";
import { MessageType } from "@/types";

export interface Event {
    eventType: EventType;
    duration: number;
    currentTime: number;
    now: Date;
}

enum EventType {
    PLAY = "PLAY",
    SEEK = "SEEK",
    PAUSE = "PAUSE",
}

/**
 * All the media events can be found here -> @see(https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)
 * Events we need to process via the background script
 * - playing (the `play` event is not enough, as we might have to wait for the buffer to grow after clicking play)
 * - pause (triggered on user pause, usually by clicking on the video)
 * - waiting (triggered when the buffer becomes empty and until it reaches some minimum size)
 * - seeked (triggered when a user jumps to a specific timestamp and the media finish the transition - we might want to restrict who can seek vs play/pause)
 *
 * The following events will be ignored
 * - play (because it is always followed by a playing event)
 *
 * - seeked (triggered when a user jumps to a specific timestamp - we might want to restrict who can seek vs play/pause)
 */
const events = [
    {
        htmlEvent: "playing",
        type: EventType.PLAY,
    },
    {
        htmlEvent: "seeked",
        type: EventType.SEEK,
    },
    {
        htmlEvent: "pause",
        type: EventType.PAUSE,
    },
    {
        htmlEvent: "waiting",
        type: EventType.PAUSE,
    },
];

export class VideoPlayer {
    private video: HTMLVideoElement;
    private port: Runtime.Port;

    constructor(video: HTMLVideoElement, port: Runtime.Port) {
        this.video = video;
        this.port = port;
        this.setupEvents();
    }

    private setupEvents() {
        events.forEach((event) => {
            this.video.addEventListener(event.htmlEvent, () => {
                this.port.postMessage({
                    type: MessageType.MEDIA_EVENT,
                    ...this.buildEvent(event.type),
                });
            });
        });
    }

    private buildEvent(eventType: EventType): Event {
        return {
            eventType,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            now: new Date(),
        };
    }

    sendEvent(event: Event) {
        console.log(event);
    }
}
