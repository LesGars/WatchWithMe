export interface MessageFromServerToExtension {
    roomId: string;
    type: MessageFromServerToExtensionType;
    serverDate: Date;
}

export enum MessageFromServerToExtensionType {
    // Sync Commands:
    SCHEDULE_PLAY = "SCHEDULE_PLAY",
    PAUSE = "PAUSE",
    CHANGE_VIDEO = "CHANGE_VIDEO",
    NEW_WATCHER = "NEW_WATCHER",
}

export interface SchedulePlaySyncCommand extends MessageFromServerToExtension {
    startAt: Date;
    startTimestamp: Number;
}

export interface PauseSyncCommand extends MessageFromServerToExtension {
    pauseTimestamp: Number;
}

export interface ChangeVideoSyncCommand extends MessageFromServerToExtension {
    newUrl: String;
    videoTimestamp: Number;
}
