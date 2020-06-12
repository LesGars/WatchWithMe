import { Runtime } from "webextension-polyfill-ts";
import {
    MediaEventType,
    MessageFromExtensionToServerType,
    PlayerEvent,
} from "../communications/from-extension-to-server";

const log = require("debug")("ext:contentscript:player");

export interface Event {
    htmlEvent:
        | "ratechange"
        | "seeking"
        | "progress"
        | "ratechange"
        | "canplaythrough"
        | "play"
        | "playing"
        | "canplay"
        | "seeked"
        | "pause"
        | "waiting";
    type: MediaEventType;
}

/**
 * All the media events can be found here -> @see(https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)
 * Events we need to process via the background script
 * - playing (the `play` event is not enough, as we might have to wait for the buffer to grow after clicking play)
 * - pause (triggered on user pause, usually by clicking on the video)
 * - waiting (triggered when the buffer becomes empty and until it reaches some minimum size)
 * - seeked (triggered when a user jumps to a specific timestamp and the media finish the transition - we might want to restrict who can seek vs play/pause)
 * - canplay (triggered when the media buffer is big enough to start playing)
 */
export const events: Event[] = [
    {
        htmlEvent: "ratechange",
        type: MediaEventType.NOP,
    },
    {
        htmlEvent: "seeking",
        type: MediaEventType.NOP,
    },
    {
        htmlEvent: "progress",
        type: MediaEventType.NOP,
    },
    {
        htmlEvent: "ratechange",
        type: MediaEventType.NOP,
    },
    {
        htmlEvent: "canplaythrough",
        type: MediaEventType.NOP,
    },
    {
        htmlEvent: "play",
        type: MediaEventType.BUFFERING,
    },
    {
        htmlEvent: "playing",
        type: MediaEventType.PLAY,
    },
    {
        htmlEvent: "canplay",
        type: MediaEventType.READY,
    },
    {
        htmlEvent: "seeked",
        type: MediaEventType.SEEK,
    },
    {
        htmlEvent: "pause",
        type: MediaEventType.PAUSE,
    },
    {
        htmlEvent: "waiting",
        type: MediaEventType.BUFFERING,
    },
];

/**
 * Event that we will have to intercept and to trigger a pause on the video
 */
const interceptedEvents = new Set(["seeking", "play"]);

export class VideoPlayer {
    private video: HTMLVideoElement;
    private port: Runtime.Port;

    private interceptors: ((event: Event) => void)[] = [];
    private preventPlay = true; // Default behavior is to prevent play until syncOrder is received

    constructor(video: HTMLVideoElement, port: Runtime.Port) {
        this.video = video;
        this.port = port;
        this.setupEvents();
    }

    private setupEvents() {
        log("Binding to html media event");
        events.forEach((event) => {
            this.video.addEventListener(event.htmlEvent, () => {
                if (interceptedEvents.has(event.htmlEvent))
                    this.interceptEvent();

                if (event.type === MediaEventType.NOP) return;

                this.interceptors.forEach((interceptor) => interceptor(event));

                this.port.postMessage({
                    type: MessageFromExtensionToServerType.UPDATE_WATCHER_STATE,
                    ...this.buildEvent(event.type),
                });
            });
        });
    }

    buildEvent(mediaEventType: MediaEventType): PlayerEvent {
        return {
            mediaEventType,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            now: new Date(),
        };
    }

    private interceptEvent() {
        if (this.preventPlay) {
            log("Pause video - INTERCEPTED");
            this.video.pause();
        }
    }

    sendEvent(event: PlayerEvent) {
        console.log(event);
    }

    addInterceptor(func: (event: Event) => void) {
        this.interceptors.push(func);
    }

    /**
     * Force the video player to play, ignoring default behavior to keep the video paused
     */
    public play() {
        log("WATCH WITH ME");
        this.preventPlay = false;
        this.video.play();
        this.preventPlay = true;
    }

    public seek(at: Number) {
        this.video.currentTime = at.valueOf();
    }
}
