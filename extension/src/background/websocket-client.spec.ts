/**
 * @jest-environment jsdom
 */

import sinon from "sinon";
import WebSocketClient from "./websocket-client";

describe("WebSocketClient.ensureOpened", () => {
    it("resolves the promise when the socket is opened", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.OPEN,
            } as any);
        const client: WebSocketClient = new WebSocketClient("wss://fake", () =>
            console.log("ok")
        );

        await expect(client.ensureOpened()).resolves.not.toBeDefined();

        wsStub.restore();
    });

    it("throws an error when the socket is connecting", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.CONNECTING,
            } as any);
        const client: WebSocketClient = new WebSocketClient("wss://fake", () =>
            console.log("ok")
        );

        await expect(client.ensureOpened()).rejects.toThrow();

        wsStub.restore();
    });

    it("throws an error when the socket is closing", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.CLOSING,
            } as any);
        const client: WebSocketClient = new WebSocketClient("wss://fake", () =>
            console.log("ok")
        );

        await expect(client.ensureOpened()).rejects.toThrow();

        wsStub.restore();
    });

    it("tries to reconnect when the socket is closed", async () => {
        const wsStub = sinon
            .stub(WebSocketClient.prototype, "getWebSocket")
            .returns({
                readyState: WebSocket.CLOSED,
            } as any);
        const connectStub = sinon
            .stub(WebSocketClient.prototype, "connect")
            .resolves();
        const client: WebSocketClient = new WebSocketClient("wss://fake", () =>
            console.log("ok")
        );

        await expect(client.ensureOpened()).resolves.not.toBeDefined();
        expect(connectStub.calledOnce).toBeTruthy();

        wsStub.restore();
        connectStub.restore();
    });
});
