import { minBufferTimeInSeconds, WatcherState } from "@/types";
import { Runtime } from "webextension-polyfill-ts";
import {
    MessageFromExtensionToServerType,
    PlayerEvent,
} from "../communications/from-extension-to-server";
import { WAIT_FOR_ALL_WATCHERS_URL } from "../constants";

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
    // Type is undefined when it should not trigger state update
    type: WatcherState | undefined;
}

export enum HtmlVideoPlayerEventType {
    ratechange = "ratechange",
    seeking = "seeking",
    progress = "progress",
    canplaythrough = "canplaythrough",
    play = "play",
    playing = "playing",
    canplay = "canplay",
    seeked = "seeked",
    pause = "pause",
    waiting = "waiting",
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
        type: undefined,
    },
    {
        htmlEvent: "seeking",
        type: WatcherState.UNKNOWN,
    },
    {
        htmlEvent: "progress",
        type: undefined,
    },
    {
        htmlEvent: "canplaythrough",
        type: undefined,
    },
    {
        htmlEvent: "play",
        type: WatcherState.BUFFERING,
    },
    {
        htmlEvent: "playing",
        type: WatcherState.PLAYING,
    },
    {
        htmlEvent: "canplay",
        type: WatcherState.READY,
    },
    {
        htmlEvent: "seeked",
        type: WatcherState.BUFFERING,
    },
    {
        htmlEvent: "pause",
        type: WatcherState.READY,
    },
    {
        htmlEvent: "waiting",
        type: WatcherState.BUFFERING,
    },
];

export enum InterceptorResult {
    DoIntercept,
    DoNotIntercept,
}

/**
 * Event that we will have to intercept and to trigger a pause on the video
 */
const interceptedEvents = new Set(["seeking", "play", "playing"]);

export class VideoPlayer {
    private video: HTMLVideoElement;
    private port: Runtime.Port;
    private toggleOverlay: (string: string) => void;

    private eventHandlers: ((event: Event) => void)[] = [];
    private preventPlay = true; // Default behavior is to prevent play until syncPlayCommand is received

    private prevBufferAmount: null | number = null;
    private prevBufferTime: null | number = null;

    constructor(
        video: HTMLVideoElement,
        port: Runtime.Port,
        toggleOverlay: (string: string) => void
    ) {
        this.video = video;
        this.port = port;
        this.toggleOverlay = toggleOverlay;
        this.setupEvents();
    }

    private setupEvents() {
        log("Binding to html media event");
        events.forEach((event) => {
            this.video.addEventListener(event.htmlEvent, () => {
                if (event.type === undefined) return;

                let eventIsIntercepted = false;
                if (interceptedEvents.has(event.htmlEvent)) {
                    eventIsIntercepted =
                        this.maybeInterceptEvent(event) ==
                        InterceptorResult.DoIntercept;
                }

                this.eventHandlers.forEach((handler) => handler(event));

                log(
                    `event ${event.htmlEvent} ${
                        eventIsIntercepted
                            ? "intercepted and not dispatched to BG script"
                            : "not intercepted and dispatched to BG script"
                    }`
                );

                if (!eventIsIntercepted) {
                    this.pushPlayerStateToBGScript(event.type);
                }
            });
        });
    }

    buildEvent(watcherState: WatcherState): PlayerEvent {
        return {
            watcherState,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            now: new Date(),
        };
    }

    /**
     * Decide wether event should be intercepted based on internal state of the player
     *
     * When the user clicks play, the video is paused immediately after being started (cf sync Play start)
     * We want to notify the server of the new SyncPlay intent
     * but we do not want to update the watcherState (video remains paused)
     *
     */
    private maybeInterceptEvent(event: Event): InterceptorResult {
        if (this.preventPlay) {
            this.video.pause();
            this.toggleOverlay(WAIT_FOR_ALL_WATCHERS_URL);
            return InterceptorResult.DoIntercept;
        } else {
            // If we end up here, it means we have received a SyncPlay Command
            if (event.htmlEvent == "playing") {
                this.preventPlay = true;
            }
        }

        return InterceptorResult.DoNotIntercept;
    }

    sendEvent(event: PlayerEvent) {
        console.log(event);
    }

    addEventHandler(func: (event: Event) => void) {
        this.eventHandlers.push(func);
    }

    /**
     * Force the video player to play, ignoring default behavior to keep the video paused
     */
    public play() {
        log("WATCH WITH ME");
        this.preventPlay = false;
        this.video.play();
        // => preventPlay will be re-enabled asynchronously
        // (only after receiving "playing" event)
    }

    public seek(at: Number) {
        this.video.currentTime = at.valueOf();
    }

    /**
     * Sends the current player state to the BG script
     */
    public pushPlayerStateToBGScript(type: WatcherState | void) {
        const resolvedType = type || this.resolveVideoStatus();
        this.port.postMessage({
            type: MessageFromExtensionToServerType.UPDATE_WATCHER_STATE,
            ...this.buildEvent(resolvedType),
        });
    }

    resolveVideoStatus(): WatcherState {
        if (this.video.paused) {
            if (this.isBuffering()) {
                return WatcherState.BUFFERING;
            }
            return WatcherState.READY;
        } else {
            return WatcherState.PLAYING;
        }
    }

    /**
     * Based on https://stackoverflow.com/a/34135974/2832282
     */
    isBuffering(): boolean {
        if (
            this.video.buffered &&
            this.video.buffered.end &&
            this.video.buffered.length > 0
        ) {
            const buffer = this.video.buffered.end(0);
            const time = this.video.currentTime;

            // Check if the video hangs because of issues with e.g. performance
            if (
                this.prevBufferAmount === buffer &&
                this.prevBufferTime === time &&
                !this.video.paused
            ) {
                return true;
            }
            this.prevBufferAmount = buffer;
            this.prevBufferTime = time;
            // Check if video buffer is less
            // than current time (tolerance 3 sec)

            return buffer - minBufferTimeInSeconds < time;
        }
        return false;
    }
}
