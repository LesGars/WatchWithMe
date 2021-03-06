import {
    MessageFromServerToExtension,
    MessageFromServerToExtensionType,
    SchedulePlaySyncCommand,
} from "@/communications/from-server-to-extension";
import { setStorageItem } from "@/utils";
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
    log(`Received from the server the following type: ${broadcastEvent.type}`);
    switch (broadcastEvent.type) {
        case MessageFromServerToExtensionType.SCHEDULE_PLAY:
            const schedulePlayEvent = broadcastEvent as SchedulePlaySyncCommand;
            log(
                "Received syncPlay command from the server, dispatching to content script"
            );
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

const handleContentOrPopupScriptConnection = (
    incomingConnection: Runtime.Port
): void => {
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
                notifyServerOfWatcherState(m as PlayerEvent);
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

/**
 * Centralise all room change  oeprations
 * We cannot get watcher connection ID until the server confirms the creation however
 * (as the room may already exist)
 */
async function changeRoom(roomId: string) {
    try {
        setStorageItem("roomId", roomId);
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

async function notifyServerOfWatcherState(playerEvent: PlayerEvent) {
    const roomId =
        currentRoomId ?? (await browser.storage.sync.get("roomId"))?.roomId;
    if (!roomId) {
        log(
            `Cannot process ${playerEvent.watcherState} watcher state since no room was joined`
        );
        return;
    }
    log(`Sending ${playerEvent.watcherState} state update to the server`);
    const eventForServer: UpdateWatcherState = {
        action: MessageFromExtensionToServerType.UPDATE_WATCHER_STATE,
        roomId,
        playerEvent,
    };
    sendMessageThroughWebSocket(eventForServer);
}

/**
 * Helper to correctly wrap an extension to server communication with relevant data
 */
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

browser.runtime.onConnect.addListener(handleContentOrPopupScriptConnection);
