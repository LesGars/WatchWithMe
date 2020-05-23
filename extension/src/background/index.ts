import { CS_SCRIPT_NAME } from "@/contentscript";
import { POPUP_SCRIPT_NAME } from "@/popup";
import { browser, Runtime } from "webextension-polyfill-ts";
import { MessageType } from "../types";
import WebSocketClient from "./websocket-client";

const log = require("debug")("ext:background");

log(
    `Preparing future Websocket connections on host ${process.env.WS_URL || ""}`
);
let wsClient: WebSocketClient = new WebSocketClient(process.env.WS_URL || "");

async function changeRoom(roomId: string) {
    try {
        browser.storage.sync.set({ roomId });
        sendMessageThroughWebSocket({
            action: MessageType.CHANGE_ROOM,
            roomId,
        });
        log(`[BG] Joined WatchWithMe room ${roomId}`);
    } catch (e) {
        log(`[BG] Error joining room : ${e}`);
    }
    // TODO : notify PS/CS that a room was joined (chat, etc)
}

function sendMessageThroughWebSocket(message: any) {
    wsClient.send(JSON.stringify(message));
}

let portFromCS: Runtime.Port;
let portFromPS: Runtime.Port;

const logAndRememberNewConnection = (p: Runtime.Port): void => {
    let message = `[BG] ${p.name} connected`;

    if (p.name === CS_SCRIPT_NAME) {
        message += ` (from tab ${p.sender?.tab?.title})`;
        // There is one new CS connection per page loaded on a tab with the extension
        portFromCS = p;
    } else if (p.name === POPUP_SCRIPT_NAME) {
        // There is one new PS connection everytime the application popup opens
        portFromPS = p;
    }
    log(message);
};

const connected = (p: Runtime.Port): void => {
    logAndRememberNewConnection(p);

    p.onMessage.addListener((m: any) => {
        const type = m.type as MessageType;
        switch (type) {
            case MessageType.CHANGE_ROOM: {
                const { roomId } = m;
                changeRoom(roomId);
                break;
            }
            case MessageType.DEBUG_MESSAGE: {
                log(`[BG] Message from ${p.name}`, m.message);
                break;
            }
            case MessageType.MEDIA_EVENT: {
                console.log(`[BG] Sending ${m.mediaEventType} to WebSocket`);
                sendMessageThroughWebSocket(m);
            }
        }
    });
};
browser.runtime.onConnect.addListener(connected);
