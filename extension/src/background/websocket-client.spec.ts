import { WebSocket } from "mock-socket";
import WebSocketClient from "./websocket-client";

// override "global" because "Global" type has no attribute "WebSocket"
const globalAny: any = global;
globalAny.WebSocket = WebSocket;

test("WebSocket should be opened after connection", () => {
    const client: WebSocketClient = new WebSocketClient("wss://fake");
    client.connect().then(() => {
        expect(client.getWebSocket().readyState).toBe(WebSocket.OPEN);
    });
});
