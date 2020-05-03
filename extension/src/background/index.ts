import { browser, Runtime } from "webextension-polyfill-ts";
import { MessageType } from "../types";

const log = require("debug")("ext:background");

async function polling() {
    // Use this function for periodic background polling
    log(`Polling`);
}

async function fetchPreviousRoomId() {
    // Maybe boot a random roomId on first load ?
    return browser.storage.sync.get({ roomId: undefined });
}
// TODO : Connect to previous roomId using websocket

var portFromCS: Runtime.Port;

const connected = (p: Runtime.Port) => {
    portFromCS = p;
    console.log("[BG] Content Script connected");
    portFromCS.postMessage({
        type: MessageType.DEBUG_MESSAGE,
        message: "[BG] Sending message to CS",
    });

    portFromCS.onMessage.addListener((m: any) => {
        const type = m.type as MessageType;
        switch (type) {
            case MessageType.CHANGE_ROOM: {
                const { roomId } = m;
                browser.storage.sync.set({ roomId });
                // TODO : Connect to roomId using websocket
                console.log(`[BG] Joined WatchWithMe room ${roomId}`);
                break;
            }
            case MessageType.DEBUG_MESSAGE: {
                console.log("[BG] Message from CS", m.message);
                break;
            }
        }
    });
};
browser.runtime.onConnect.addListener(connected);
