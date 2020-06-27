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

const playEventHandler = (event): void => {
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
                videoPlayer.addEventHandler(playEventHandler);
                videoPlayer.pushPlayerStateToBGScript();
            } else {
                csPort.disconnect();
            }

            break;
        }
        case MessageFromServerToExtensionType.SCHEDULE_PLAY: {
            const schedulePlayEvent = event as SchedulePlaySyncCommand;
            // See https://stackoverflow.com/a/52931503/2832282
            const delayInSec =
                new Date(schedulePlayEvent.startAt).getTime() -
                new Date().getTime();
            log(
                `Received SyncPlay command, seeking to ${schedulePlayEvent.startTimestamp}` +
                    `and scheduling play at ${schedulePlayEvent.startAt} ` +
                    `in ${delayInSec} seconds`
            );
            videoPlayer.seek(schedulePlayEvent.startTimestamp);
            setTimeout(() => videoPlayer.play(), delayInSec);
        }
    }
});

detectIfJoiningARoomFromUrl();
