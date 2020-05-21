/**
 * @jest-environment jsdom
 */

import WebSocketClient from "./websocket-client";
import sinon from "sinon";

describe("WebSocketClient.ensureOpened", () => {
    it("resolves the promise when the socket is opened", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.OPEN,
            });
        const client: WebSocketClient = new WebSocketClient("wss://fake");

        await expect(client.ensureOpened()).resolves.not.toBeDefined();

        wsStub.restore();
    });

    it("throws an error when the socket is connecting", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.CONNECTING,
            });
        const client: WebSocketClient = new WebSocketClient("wss://fake");

        await expect(client.ensureOpened()).rejects.toThrow();

        wsStub.restore();
    });

    it("throws an error when the socket is closing", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.CLOSING,
            });
        const client: WebSocketClient = new WebSocketClient("wss://fake");

        await expect(client.ensureOpened()).rejects.toThrow();

        wsStub.restore();
    });

    it("tries to reconnect when the socket is closed", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.CLOSED,
            });
        const connectStub = sinon
            .stub(WebSocketClient.prototype, "connect")
            .resolves();
        const client: WebSocketClient = new WebSocketClient("wss://fake");

        await expect(client.ensureOpened()).resolves.not.toBeDefined();
        expect(connectStub.calledOnce).toBeTruthy();

        wsStub.restore();
        connectStub.restore();
    });
});
