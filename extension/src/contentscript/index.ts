console.log(`Loaded into page`);

import { browser } from "webextension-polyfill-ts";

const myPort = browser.runtime.connect(undefined, { name: "PORT-CS" });
myPort.postMessage("This is the content script");

myPort.onMessage.addListener((message: any) => {
    console.log("[CS] Message received from BG script");
    console.log(message);
});

const video = document.querySelector("video");
if (video) {
    video.addEventListener("playing", () => {
        myPort.postMessage("[CS] Video is playing");
    });

    // TODO Send messages for other events
}
