import { browser } from "webextension-polyfill-ts";
import { MessageFromExtensionToServerType } from "../communications/from-extension-to-server";
import { VideoPlayer } from "./player";
import { CS_SCRIPT_NAME } from "@/utils/constants";

const log = require("debug")("ext:contentscript");
let videoPlayer: VideoPlayer;

const detectIfJoiningARoomWithTHeUrl = () => {
    log("Try to detect existing room");
    const roomId = new URLSearchParams(window.location.search).get("roomId");
    if (roomId) {
        log(
            `detected roomId ${roomId} from URL param, notifying background script`
        );
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
            } else {
                csPort.disconnect();
            }

            break;
        }
    }
});

detectIfJoiningARoomWithTHeUrl();
