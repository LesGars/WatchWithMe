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
    SUCCESS = "SUCCESS", // When replying to WS message sent from client
}

export interface SchedulePlaySyncCommand extends MessageFromServerToExtension {
    startAt: Date;
    startTimestamp: Number;
    type: MessageFromServerToExtensionType.SCHEDULE_PLAY;
}

export interface PauseSyncCommand extends MessageFromServerToExtension {
    pauseTimestamp: Number;
    type: MessageFromServerToExtensionType.PAUSE;
}

export interface ChangeVideoSyncCommand extends MessageFromServerToExtension {
    newUrl: String;
    videoTimestamp: Number;
    type: MessageFromServerToExtensionType.CHANGE_VIDEO;
}
