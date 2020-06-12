import {
    MessageFromServerToExtensionType,
    SchedulePlaySyncCommand,
} from "@/communications/from-server-to-extension";
import { SyncIntent } from "@/types";
import { CS_SCRIPT_NAME } from "@/utils/constants";
import { browser } from "webextension-polyfill-ts";
import { MessageFromExtensionToServerType } from "../communications/from-extension-to-server";
import { VideoPlayer } from "./player";

const log = require("debug")("ext:contentscript");
let videoPlayer: VideoPlayer;
let owner = true;

const playEventHandler = (event) => {
    if (event.htmlEvent === "play") {
        csPort.postMessage({
            type: MessageFromExtensionToServerType.UPDATE_SYNC_INTENT,
            syncIntent: SyncIntent.PLAY,
        });
    }
};

const detectIfJoiningARoomFromUrl = () => {
    log("Try to detect existing room");
    const roomId = new URLSearchParams(window.location.search).get("roomId");
    if (roomId) {
        log(
            `detected roomId ${roomId} from URL param, notifying background script`
        );
        owner = false;
        csPort.postMessage({
            type: MessageFromExtensionToServerType.CHANGE_ROOM,
            roomId,
        });
    } else {
        log("No room could be found");
    }
};

const csPort = browser.runtime.connect(undefined, { name: CS_SCRIPT_NAME });
csPort.onMessage.addListener((event) => {
    switch (event.type) {
        case MessageFromExtensionToServerType.CHANGE_ROOM: {
            log("We joined a room so let's create a video player");
            const video = document.querySelector("video");
            if (video) {
                video.pause();
                videoPlayer = new VideoPlayer(video, csPort);
                videoPlayer.addInterceptor(playEventHandler);
            } else {
                csPort.disconnect();
            }

            break;
        }
        case MessageFromServerToExtensionType.SCHEDULE_PLAY: {
            const schedulePlayEvent = event as SchedulePlaySyncCommand;
            videoPlayer.seek(schedulePlayEvent.startTimestamp);
            setTimeout(
                () => videoPlayer.play(),
                schedulePlayEvent.startAt.getTime() - new Date().getTime()
            );
        }
    }
});

detectIfJoiningARoomFromUrl();
