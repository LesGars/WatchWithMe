import { browser } from "webextension-polyfill-ts";
import { MessageType } from "../types";

console.log(`[CS] Loading WatchWithMe Extension content script`);

const csPort = browser.runtime.connect(undefined, { name: "PORT-CS" });
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

csPort.onMessage.addListener((message: any) => {
    console.log("[CS] Message received from BG script : ", message);
});

const video = document.querySelector("video");
if (video) {
    video.addEventListener("playing", () => {
        csPort.postMessage("[CS] Video is playing");
    });

    // TODO Send messages for other events
}
