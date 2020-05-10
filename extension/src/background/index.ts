import { browser, Runtime } from "webextension-polyfill-ts";
import { MessageType } from "../types";
import WebSocketClient from "./websocket-client";

const log = require("debug")("ext:background");

async function polling() {
    // Use this function for periodic background polling
    log(`Polling`);
}

async function fetchPreviousRoomId(): Promise<{ [s: string]: any }> {
    // Maybe boot a random roomId on first load ?
    return browser.storage.sync.get({ roomId: undefined });
}

const wsClient: WebSocketClient = new WebSocketClient(process.env.WS_URL || "");

async function connectToWebSocket() {
    try {
        await wsClient.connect();
        console.log("Connected to WebSocket");
        wsClient.getWebSocket().onmessage = (event: any) => {
            // Since the messages are supposed to be in JSON format, should be: JSON.parse(event.data)
            const receivedMsg = event.data;
            console.log(`[WS-S] ${receivedMsg}`);
        };
    } catch (e) {
        console.log(e);
    }
}

// Connect to previous roomId using websocket
async function connectToPreviousRoom() {
    const roomId = await fetchPreviousRoomId();
    sendMessageThroughWebSocket({ type: MessageType.CHANGE_ROOM, roomId });
}

function sendMessageThroughWebSocket(message: any) {
    const webSocket = wsClient.getWebSocket();
    if (webSocket.readyState === WebSocket.OPEN) {
        wsClient.getWebSocket().send(JSON.stringify(message));
    } else {
        console.error("[BG]: WebSocket not open");
    }
}

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
                // Connect to roomId using websocket
                connectToPreviousRoom();
                console.log(`[BG] Joined WatchWithMe room ${roomId}`);
                break;
            }
            case MessageType.DEBUG_MESSAGE: {
                console.log("[BG] Message from CS", m.message);
                break;
            }
            case MessageType.MEDIA_EVENT: {
                console.log(`[BG] Sending ${m.eventType} to WebSocket`);
                sendMessageThroughWebSocket(m);
            }
        }
    });

    connectToWebSocket();
};
browser.runtime.onConnect.addListener(connected);
