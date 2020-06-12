import {
    MessageFromServerToExtension,
    MessageFromServerToExtensionType,
    SchedulePlaySyncCommand,
} from "@/communications/from-server-to-extension";
import { CS_SCRIPT_NAME, POPUP_SCRIPT_NAME } from "@/utils/constants";
import { browser, Runtime } from "webextension-polyfill-ts";
import {
    MessageFromExtensionToServer,
    MessageFromExtensionToServerType,
    PlayerEvent,
    UpdateWatcherState,
} from "../communications/from-extension-to-server";
import WebSocketClient from "./websocket-client";

const log = require("debug")("ext:background");
log(
    `Preparing future Websocket connections on host ${process.env.WS_URL || ""}`
);

let currentRoomId: string | undefined = undefined;
let portFromCS: Runtime.Port;
let portFromPS: Runtime.Port;

const incomingServerMessageHandler = (
    broadcastEvent: MessageFromServerToExtension
): void => {
    switch (broadcastEvent.type) {
        case MessageFromServerToExtensionType.SCHEDULE_PLAY:
            const schedulePlayEvent = broadcastEvent as SchedulePlaySyncCommand;
            // Ask content script to play the video
            portFromCS.postMessage(schedulePlayEvent);

            // TODO : set internal state to PLAY_SCHEDULED
            break;
        case MessageFromServerToExtensionType.PAUSE:
            // TODO
            break;
        case MessageFromServerToExtensionType.CHANGE_VIDEO:
            break;
        default:
            break;
    }
};

let wsClient: WebSocketClient = new WebSocketClient(
    process.env.WS_URL || "",
    incomingServerMessageHandler
);

const logAndRememberNewConnection = (p: Runtime.Port): void => {
    let message = `${p.name} connected`;

    if (p.name === CS_SCRIPT_NAME) {
        message += ` (from tab ${p.sender?.tab?.title})`;
        // There is one new CS connection per page loaded on a tab with the extension
        // TODO What happen if I have more than one tab with youtube on it ?
        portFromCS = p;
    } else if (p.name === POPUP_SCRIPT_NAME) {
        message += ` (from popup)`;
        // There is one new PS connection everytime the application popup opens
        portFromPS = p;
    }
    log(message);
};

const connected = (incomingConnection: Runtime.Port): void => {
    logAndRememberNewConnection(incomingConnection);

    incomingConnection.onMessage.addListener((m: any) => {
        const type = m.type as MessageFromExtensionToServerType;
        switch (type) {
            case MessageFromExtensionToServerType.CHANGE_ROOM: {
                const { roomId } = m;
                changeRoom(roomId);
                break;
            }
            case MessageFromExtensionToServerType.DEBUG_MESSAGE: {
                log(`DEBUGMESSAGE from ${incomingConnection.name}`, m.message);
                break;
            }
            case MessageFromExtensionToServerType.UPDATE_WATCHER_STATE: {
                processMediaEvent(m as PlayerEvent);
                break;
            }
            case MessageFromExtensionToServerType.UPDATE_SYNC_INTENT: {
                processEvent(
                    MessageFromExtensionToServerType.UPDATE_SYNC_INTENT,
                    { syncIntent: m.syncIntent }
                );
                break;
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

        log(`Joined WatchWithMe room ${roomId}`);
    } catch (e) {
        log(`Error joining room : ${e}`);
    }

    const eventForEXT = {
        type: MessageFromExtensionToServerType.CHANGE_ROOM,
        roomId,
    };

    if (portFromCS) portFromCS.postMessage(eventForEXT);
    if (portFromPS) portFromPS.postMessage(eventForEXT);
}

async function processMediaEvent(playerEvent: PlayerEvent) {
    const roomId =
        currentRoomId ?? (await browser.storage.sync.get("roomId"))?.roomId;
    if (!roomId) {
        log(
            `Cannot process ${playerEvent.mediaEventType} media event since no room was joined`
        );
        return;
    }
    log(`Sending ${playerEvent.mediaEventType} media event to WebSocket`);
    const eventForServer: UpdateWatcherState = {
        action: MessageFromExtensionToServerType.UPDATE_WATCHER_STATE,
        roomId,
        playerEvent,
    };
    sendMessageThroughWebSocket(eventForServer);
}

async function processEvent(
    type: MessageFromExtensionToServerType,
    otherProps: {}
) {
    const roomId =
        currentRoomId ?? (await browser.storage.sync.get("roomId"))?.roomId;
    if (!roomId) {
        log(`Cannot process event ${type}`);
        return;
    }
    log(`Sending ${type} event to WebSocket`);
    const eventForServer: MessageFromExtensionToServer = {
        action: MessageFromExtensionToServerType.UPDATE_SYNC_INTENT,
        roomId,
        ...otherProps,
    };
    sendMessageThroughWebSocket(eventForServer);
}

function sendMessageThroughWebSocket(message: MessageFromExtensionToServer) {
    wsClient.send(JSON.stringify(message));
}

browser.runtime.onConnect.addListener(connected);
