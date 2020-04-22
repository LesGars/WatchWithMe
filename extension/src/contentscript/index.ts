console.log(`Loaded into page`);

import { browser } from "webextension-polyfill-ts";

const myPort = browser.runtime.connect(undefined, { name: "PORT-CS" });
myPort.postMessage({ greeting: "This is the content script" });

myPort.onMessage.addListener((message: any) => {
    console.log("Message received from BG script");
    console.log(message.greeting);
});

document.body.addEventListener("click", () => {
    console.log("click");
    myPort.postMessage({ greeting: "clickCS" });
});
