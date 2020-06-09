import { SyncIntent } from "../types";

export enum MediaEventType {
    NOP = "NOP",
    PLAY = "PLAY",
    BUFFERING = "BUFFERING",
    READY = "READY",
    SEEK = "SEEK",
    PAUSE = "PAUSE",
}

export interface PlayerEvent {
    mediaEventType: MediaEventType;
    duration: number;
    currentTime: number;
    now: Date;
}

export interface MessageFromExtensionToServer {
    roomId: string;
    action: MessageFromExtensionToServerType; // Route to AWS Lambda function
}

/**
 * Type of messages accepted by the server
 * Keep them in sync with serverless.yml (and in dash-case)
 */
export enum MessageFromExtensionToServerType { // those values must be in sync with AWS lambda routes of servrless.yml
    DEBUG_MESSAGE,
    UPDATE_WATCHER_STATE = "update-watcher-state",
    UPDATE_SYNC_INTENT = "update-sync-intent",
    CHANGE_ROOM = "join-room",
    GET_ROOM = "get-room", // Just ask the server to send current room info
}

export interface UpdateWatcherState extends MessageFromExtensionToServer {
    // TODO: refactor to watcherState
    playerEvent: PlayerEvent;
}

export interface UpdateSyncIntent extends MessageFromExtensionToServer {
    syncIntent: SyncIntent;
}

export interface ChangeRoom extends MessageFromExtensionToServer {}

export interface WatcherDisconnects extends MessageFromExtensionToServer {}
