import { Runtime } from "webextension-polyfill-ts";

export interface Event {
    type: EventType;
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
 * All the video events can be found @see(https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)
 * we will only trigger events to the background script in case of
 * - playing (trigger at any time when the media starts playing)
 * - pause (triggered on user pause)
 * - waiting (triggered by buffering)
 * - seeked (because we might want to restrict who can seek vs pause play the media)
 *
 * The following events will be ignored
 * - play (because it is always followed by a playing event)
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
                this.port.postMessage(this.buildEvent(event.type));
            });
        });
    }

    private buildEvent(type: EventType): Event {
        return {
            type,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            now: new Date(),
        };
    }

    sendEvent(event: Event) {
        console.log(event);
    }
}
