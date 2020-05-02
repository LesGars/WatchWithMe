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
    alarms: typeof chrome.alarms;
    bookmarks: typeof chrome.bookmarks;
    browserAction: typeof chrome.browserAction;
    commands: typeof chrome.commands;
    contextMenus: typeof chrome.contextMenus;
    cookies: typeof chrome.cookies;
    downloads: typeof chrome.downloads;
    // events: typeof chrome.events
    extension: typeof chrome.extension;
    // extensionTypes: typeof chrome.extensionTypes
    history: typeof chrome.history;
    i18n: typeof chrome.i18n;
    idle: typeof chrome.idle;
    nortifications: typeof chrome.notifications;
    pageAction: typeof chrome.pageAction;
    runtime: typeof chrome.runtime;
    storage: typeof chrome.storage;
    tabs: typeof chrome.tabs;
    webNavigation: typeof chrome.webNavigation;
    webRequest: typeof chrome.webRequest;
    windows: typeof chrome.windows;

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

export enum MessageType {
    DEBUG_MESSAGE,
    CHANGE_ROOM,
}

/**
 * Video status for one user
 */
enum UserVideoStatus {
    UNKNOWN = "UNKNOWN", // Still Loading of DOM, or not on the video URL, or any othe reason (no info from Video API)
    BUFFERING = "BUFFERING", // has not reached minBufferLength (video is paused or not started)
    PLAYING = "PLAYING", // is currently playing the video
    READY = "READY", // (equivalent of Waiting or Paused) has buffered enough of the video, is pending start signal
}

/**
 * Video status for all players that have completed initial Sync
 */
enum VideoSyncStatus {
    PAUSED = "PAUSED", // video is paused and no action should be taken (apart from buffering)
    WAITING = "WAITING", // waiting for all players to be in waiting status before playing
    PLAYING = "PLAYING", // video should playing normally on all user browsers
}

/**
 * Information about one user
 */
export class Watcher {
    id: string; // maybe not needed since it will be the index key
    connectionId: string; // The kind of info we need to be able to communicate with the user (TOCONFIRM: just a string is enough ?)
    joinedAt: number;
    lastVideoTimestamp: number; // Last video timestamp received during sync events of said user
    lastHeartbeat: number; // date of last event during sync received from said user
    currentVideoStatus: UserVideoStatus;
    initialSync: boolean = false;

    userAgent: string; // Might help debug issues later
}

export class Room {
    roomId: string; // Partition key for DDB
    createdAt: number;
    watchers: Record<string, Watcher>;
    ownerId: string;

    // Config options
    minBufferLength: number = 5; // Number of seconds each person should have loaded before resuming
    videoSpeed: number = 1; // speed of video (2 means 2x)

    // History attributes
    currentVideoUrl: string; // URL of
    syncStartedAt: number; // Date when the video was first watched synchronously
    syncStartedTimestamp: number; // Timestamp of the video when it was first watched synchronously

    // Sync values
    videoStatus: VideoSyncStatus;
    resumePlayingAt: number | null; // Date when players should resume watching if status is Waiting. If null, it means not all players are ready
    resumePlayingTimestamp: number; // Timestamp that should be seeked by users before video can start
}

export const maxSecondsBetweenWatchers = 1; // max time that can separate 2 people watching the same vide when they are synced
