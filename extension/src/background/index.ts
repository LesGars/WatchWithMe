import { Poller } from "./poller";
import { browser, Runtime } from "webextension-polyfill-ts";

const log = require("debug")("ext:background");

async function polling() {
    // Use this function for periodic background polling
    log(`Polling`);
}

Poller.getInstance(polling);

var portFromCS: Runtime.Port;

const connected = (p: Runtime.Port) => {
    portFromCS = p;
    portFromCS.postMessage("Sending message to CS");
    portFromCS.onMessage.addListener((m: any) => {
        console.log(`[BG] Message from CS -> ${JSON.stringify(m)}`);
    });
};

browser.runtime.onConnect.addListener(connected);
