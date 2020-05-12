import { browser } from "webextension-polyfill-ts";
import { MessageType } from "../types";
import { Event, VideoPlayer } from "./player";

export const CS_SCRIPT_NAME = "WWM Content-Script";

const csPort = browser.runtime.connect(undefined, { name: CS_SCRIPT_NAME });
csPort.postMessage({
    type: MessageType.DEBUG_MESSAGE,
    message: "[CS] This is the content script",
});

const roomId = new URLSearchParams(window.location.search).get("roomId");
if (roomId) {
    console.log(
        `[CS] detected roomId ${roomId} from URL param, notifying background script`
    );
    csPort.postMessage({ type: MessageType.CHANGE_ROOM, roomId });
} else {
    console.log("[CS] Invalid URL missing roomID");
}

const video = document.querySelector("video");
if (video) {
    const videoPlayer = new VideoPlayer(video, csPort);
} else {
    csPort.disconnect();
}
