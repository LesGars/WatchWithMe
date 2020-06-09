import { Runtime } from "webextension-polyfill-ts";
import {
    MessageFromExtensionToServerType,
    MediaEventType,
    PlayerEvent,
} from "../communications/from-extension-to-server";

const log = require("debug")("ext:contentscript:player");

/**
 * All the media events can be found here -> @see(https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events)
 * Events we need to process via the background script
 * - playing (the `play` event is not enough, as we might have to wait for the buffer to grow after clicking play)
 * - pause (triggered on user pause, usually by clicking on the video)
 * - waiting (triggered when the buffer becomes empty and until it reaches some minimum size)
 * - seeked (triggered when a user jumps to a specific timestamp and the media finish the transition - we might want to restrict who can seek vs play/pause)
 * - canplay (triggered when the media buffer is big enough to start playing)
 */
const events = [
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

    constructor(video: HTMLVideoElement, port: Runtime.Port) {
        this.video = video;
        this.port = port;
        this.setupEvents();
    }

    private setupEvents() {
        log("Binding to html media event");
        events.forEach((event) => {
            this.video.addEventListener(event.htmlEvent, () => {
                log(`New media event ${event.htmlEvent}`);
                if (event.type === MediaEventType.NOP) return;

                if (interceptedEvents.has(event.htmlEvent))
                    this.interceptEvent();

                this.port.postMessage({
                    type: MessageFromExtensionToServerType.UPDATE_WATCHER_STATE,
                    ...this.buildEvent(event.type),
                });
            });
        });
    }

    private buildEvent(mediaEventType: MediaEventType): PlayerEvent {
        return {
            mediaEventType,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            now: new Date(),
        };
    }

    private interceptEvent() {
        log("Pause video - INTERCEPT");
        this.video.pause();
    }

    sendEvent(event: PlayerEvent) {
        console.log(event);
    }
}
