import { CS_SCRIPT_NAME } from "@/contentscript";
import { POPUP_SCRIPT_NAME } from "@/popup";
import { browser, Runtime } from "webextension-polyfill-ts";
import { MessageType } from "../types";
import WebSocketClient from "./websocket-client";

const log = require("debug")("ext:background");

async function polling() {
    // Use this function for periodic background polling
    log(`Polling`);
}

console.log(
    `Preparing future Websocket connections on host ${process.env.WS_URL || ""}`
);
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

async function connectToRoom(roomId: string) {
    wsClient
        .getWebSocket()
        .send(JSON.stringify({ action: MessageType.CHANGE_ROOM, roomId }));
}

var portFromCS: Runtime.Port;
var portFromPS: Runtime.Port;

const connected = (p: Runtime.Port) => {
    let message = `[BG] ${p.name} connected`;
    if (!portFromCS && !portFromPS) {
        connectToWebSocket();
        console.log(
            "[BG] First connection from any source, opening Websocket connection"
        );
    }

    if (p.name === CS_SCRIPT_NAME) {
        message += ` (from tab ${p.sender?.tab?.title})`;
        // There is one new CS connection per page loaded on a tab with the extension
        portFromCS = p;
    } else if (p.name === POPUP_SCRIPT_NAME) {
        // There is one new PS connection everytime the application popup opens
        portFromPS = p;
    }
    console.log(message);

    p.onMessage.addListener((m: any) => {
        const type = m.type as MessageType;
        switch (type) {
            case MessageType.CHANGE_ROOM: {
                const { roomId } = m;
                browser.storage.sync.set({ roomId });
                // Connect to roomId using websocket
                connectToRoom(roomId);
                console.log(`[BG] Joined WatchWithMe room ${roomId}`);
                // TODO : notify PS/CS that a room was joined (chat, etc)
                break;
            }
            case MessageType.DEBUG_MESSAGE: {
                console.log(`[BG] Message from ${p.name}`, m.message);
                break;
            }
        }
    });
};
browser.runtime.onConnect.addListener(connected);
