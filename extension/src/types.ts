// @ts-nocheck

declare const browser: typeof chrome;

const apis = [
    "alarms",
    "bookmarks",
    "browserAction",
    "commands",
    "contextMenus",
    "cookies",
    "downloads",
    // 'events',
    "extension",
    "extensionTypes",
    "history",
    "i18n",
    "idle",
    "notifications",
    "pageAction",
    "runtime",
    "storage",
    "tabs",
    "webNavigation",
    "webRequest",
    "windows",
] as Array<keyof Extension>;

export class Extension {
    alarms!: typeof chrome.alarms;
    bookmarks!: typeof chrome.bookmarks;
    browserAction!: typeof chrome.browserAction;
    commands!: typeof chrome.commands;
    contextMenus!: typeof chrome.contextMenus;
    cookies!: typeof chrome.cookies;
    downloads!: typeof chrome.downloads;
    // events: typeof chrome.events
    // events: typeof chrome.events
    extension!: typeof chrome.extension;
    // extensionTypes: typeof chrome.extensionTypes
    // extensionTypes: typeof chrome.extensionTypes
    history!: typeof chrome.history;
    i18n!: typeof chrome.i18n;
    idle!: typeof chrome.idle;
    nortifications!: typeof chrome.notifications;
    pageAction!: typeof chrome.pageAction;
    runtime!: typeof chrome.runtime;
    storage!: typeof chrome.storage;
    tabs!: typeof chrome.tabs;
    webNavigation!: typeof chrome.webNavigation;
    webRequest!: typeof chrome.webRequest;
    windows!: typeof chrome.windows;

    constructor() {
        apis.forEach((api: keyof Extension) => {
            // tslint:disable:strict-type-predicates
            if (typeof chrome !== "undefined") {
                this[api] = chrome[api];
            }
            // tslint:disable:strict-type-predicates
            if (typeof window !== "undefined" && window[api]) {
                this[api] = window[api];
            }
            // tslint:disable:strict-type-predicates
            if (typeof browser !== "undefined") {
                if (browser.extension && browser.extension[api]) {
                    this[api] = browser.extension[api];
                } else if (browser[api]) {
                    this[api] = browser[api];
                }
            }
        });

        // tslint:disable:strict-type-predicates
        if (typeof browser !== "undefined") {
            if (browser.runtime) {
                this.runtime = browser.runtime;
            }
            if (browser.browserAction) {
                this.browserAction = browser.browserAction;
            }
        }
    }
}

/**
 * An explicit user action (click on play/pasue button, click on the timeline to seek)
 * These actions are extected to trigger changes to the Watcher State,
 * and should never be transmitted to the server
 */
export enum UserAction {
    PLAY,
    PAUSE,
    SEEK,
}

/**
 * Video status for one video player
 * Every non-transitional update should be transmitted to the server
 */
export enum WatcherState {
    UNKNOWN = "UNKNOWN", // Still Loading of DOM, or not on the video URL, or any othe reason (no info from Video API)
    BUFFERING = "BUFFERING", // has not reached minBufferLength (video is paused or not started)
    READY = "READY", // (equivalent of Waiting or Paused) has buffered enough of the video, is pending start signal
    PLAY_SCHEDULED = "PLAY_SCHEDULED", // Has scheduled play at a certain time
    PLAYING = "PLAYING", // is currently playing the video
}

/**
 * The desired synchronized state between participants
 */
export enum SyncIntent {
    PLAY = "PLAY",
    PAUSE = "PAUSE",
}

/**
 * Video status for all players that have completed initial Sync
 */
export enum SyncState {
    PAUSED = "PAUSED", // video is paused and no action should be taken (apart from buffering)
    WAITING = "WAITING", // waiting for all players to be in waiting status before playing
    PLAY_SCHEDULED = "PLAY_SCHEDULED", // Indicate that the server has issues a sync play command to the players, and is waiting for players to start
    PLAYING = "PLAYING", // video should playing normally on all user browsers
}

export enum SyncCommandType {
    SCHEDULE_PLAY = "SCHEDULE_PLAY",
    PAUSE = "PAUSE",
    CHANGE_VIDEO = "CHANGE_VIDEO",
}

/**
 * Information about one user
 * Note : dates are serialized as strings in DDB
 */
export interface Watcher {
    id: string; // maybe not needed since it will be the index key
    connectionId: string; // API Gateway connection ID to be used to communicate with the user
    joinedAt: Date;
    lastVideoTimestamp: Date | undefined; // Last video timestamp received during sync events of said user
    lastHeartbeat: Date; // date of last event during sync received from said user
    currentVideoStatus: WatcherState;
    initialSync: boolean; // Must default to false

    userAgent: string; // Might help debug issues later
}

/**
 * A group of people trying to watch videos together
 * Note : dates are serialized as strings in DDB
 */
export interface Room {
    roomId: string; // Partition key for DDB
    createdAt: Date;
    watchers: Record<string, Watcher>;
    ownerId: string;

    // Config options
    minBufferLength: number; // Number of seconds each person should have loaded before resuming. Default should be 5
    videoSpeed: number; // speed of video (2 means 2x). Default should be 1

    // History attributes
    currentVideoUrl: string | undefined; // URL of video being watched
    syncStartedAt: Date | undefined; // Date when the video was first watched synchronously
    syncStartedTimestamp: Date | undefined; // Timestamp of the video when it was first watched synchronously

    // Sync values
    videoStatus: SyncState;
    resumePlayingAt: Date | undefined; // Date when players should resume watching if status is Waiting. If null, it means not all players are ready
    resumePlayingTimestamp: Date | undefined; // Timestamp that should be seeked by users before video can start
}

export const maxSecondsBetweenWatchers = 1; // max time that can separate 2 people watching the same vide when they are synced

/**
 * @deprecated - use MessageFromXToY in communications folder
 * Event coming from the websocket
 */
export interface BroadcastEvent {
    type: BroadcastEventType;
    room: Room;
}

/**
 * @deprecated - see BroadcastEvent deprecation
 */
export enum BroadcastEventType {
    NEW_WATCHER = "NEW_WATCHER",
}
