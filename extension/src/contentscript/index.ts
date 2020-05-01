import { browser } from "webextension-polyfill-ts";

console.log(`Loading WatchWithMe Extension content script`);

const csPort = browser.runtime.connect(undefined, { name: "PORT-CS" });
csPort.postMessage({
    type: "debugMessage",
    message: "[CS] This is the content script",
});

const roomId = new URLSearchParams(window.location.search).get("roomId");
if (roomId) {
    console.log(
        `[CS] detected roomId ${roomId} from URL param, notifying background script`
    );
    csPort.postMessage({ type: "changeRoom", roomId });
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
