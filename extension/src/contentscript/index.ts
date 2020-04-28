console.log(`Loaded into page`);

import { browser } from "webextension-polyfill-ts";
import { VideoPlayer, Event } from "./player";

const csPort = browser.runtime.connect(undefined, { name: "PORT-CS" });
csPort.postMessage("This is the content script");

const video = document.querySelector("video");
if (video) {
    const videoPlayer = new VideoPlayer(video, csPort);

    csPort.onMessage.addListener((message: Event) => {
        console.log("[CS] Message received from BG script");
        videoPlayer.sendEvent(message);
    });
    // TODO Send messages for other events
} else {
    csPort.disconnect();
}
