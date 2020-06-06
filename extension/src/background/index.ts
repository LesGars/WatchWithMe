import { CS_SCRIPT_NAME } from "@/contentscript";
import { POPUP_SCRIPT_NAME } from "@/popup";
import { browser, Runtime } from "webextension-polyfill-ts";
import {
    MessageFromExtensionToServer,
    MessageFromExtensionToServerType,
    UpdateWatcherState,
    PlayerEvent,
} from "../communications/from-extension-to-server";
import WebSocketClient from "./websocket-client";

const log = require("debug")("ext:background");
log(
    `Preparing future Websocket connections on host ${process.env.WS_URL || ""}`
);

let wsClient: WebSocketClient = new WebSocketClient(process.env.WS_URL || "");
let currentRoomId: string | undefined = undefined;
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
        const type = m.type as MessageFromExtensionToServerType;
        switch (type) {
            case MessageFromExtensionToServerType.CHANGE_ROOM: {
                const { roomId } = m;
                changeRoom(roomId);
                break;
            }
            case MessageFromExtensionToServerType.DEBUG_MESSAGE: {
                log(`[BG] Message from ${p.name}`, m.message);
                break;
            }
            case MessageFromExtensionToServerType.UPDATE_WATCHER_STATE: {
                processMediaEvent(m as PlayerEvent);
            }
        }
    });
};

async function changeRoom(roomId: string) {
    try {
        browser.storage.sync.set({ roomId });
        currentRoomId = roomId;
        const eventForServer: MessageFromExtensionToServer = {
            action: MessageFromExtensionToServerType.CHANGE_ROOM,
            roomId,
        };
        sendMessageThroughWebSocket(eventForServer);
        log(`[BG] Joined WatchWithMe room ${roomId}`);
    } catch (e) {
        log(`[BG] Error joining room : ${e}`);
    }
    // TODO : notify PS/CS that a room was joined (chat, etc)
}

async function processMediaEvent(playerEvent: PlayerEvent) {
    const roomId =
        currentRoomId ?? (await browser.storage.sync.get("roomId"))?.roomId;
    if (!roomId) {
        console.log(
            `[BG] Cannot process ${playerEvent.mediaEventType} media event since no room was joined`
        );
        return;
    }
    console.log(
        `[BG] Sending ${playerEvent.mediaEventType} media event to WebSocket`
    );
    const eventForServer: UpdateWatcherState = {
        action: MessageFromExtensionToServerType.UPDATE_WATCHER_STATE,
        roomId,
        playerEvent,
    };
    sendMessageThroughWebSocket(eventForServer);
}

function sendMessageThroughWebSocket(message: MessageFromExtensionToServer) {
    wsClient.send(JSON.stringify(message));
}

browser.runtime.onConnect.addListener(connected);
