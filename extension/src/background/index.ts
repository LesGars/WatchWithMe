import { browser, Runtime } from "webextension-polyfill-ts";
import { Poller } from "./poller";

const log = require("debug")("ext:background");

async function polling() {
    // Use this function for periodic background polling
    log(`Polling`);
}

async function fetchPreviousRoomId() {
    return new Promise(function (resolve, reject) {
        // Maybe boot a random roomId on load ?
        chrome.storage.sync.get({ roomId: undefined }, function (options) {
            resolve(options.roomId);
        });
    });
}
// TODO : Connect to previous roomId using websocket

Poller.getInstance(polling);

var portFromCS: Runtime.Port;

// Top level async not available apparently, so let's use a regular promise.then()
const connected = (p: Runtime.Port) => {
    portFromCS = p;
    console.log("[BG] Content Script connected");
    portFromCS.postMessage("[BG] Sending message to CS");

    portFromCS.onMessage.addListener((m: any) => {
        console.log(`[BG] Received message ${m} from content script`);
        switch (m.type) {
            case "changeRoom": {
                const { roomId } = m;
                browser.storage.sync.set({ roomId });
                // TODO : Connect to roomId using websocket
                console.log(`[BG] Joined WatchWithMe room ${roomId}`);
                break;
            }
            case "debugMessage": {
                console.log("[BG] Message from CS", m.message);
                break;
            }
        }
    });
};
browser.runtime.onConnect.addListener(connected);
