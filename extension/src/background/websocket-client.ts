import { MessageFromServerToExtension } from "@/communications/from-server-to-extension";

const log = require("debug")("ext:background:websocket");

export default class WebSocketClient {
    private host: string;
    private serverMessageHandler: (
        message: MessageFromServerToExtension
    ) => void;
    private webSocket!: WebSocket;

    public constructor(
        host: string,
        serverMessageHandler: (message: MessageFromServerToExtension) => void
    ) {
        this.host = host;
        this.serverMessageHandler = serverMessageHandler;
    }

    public getWebSocket(): WebSocket {
        return this.webSocket;
    }

    public connect(): Promise<void> {
        this.webSocket = new WebSocket(this.host);
        return new Promise((resolve) => {
            this.webSocket.onopen = () => {
                this.webSocket.send(
                    JSON.stringify({
                        message: "[WS-E] Connected to server",
                    })
                );
                resolve();
            };

            this.webSocket.onmessage = (event: MessageEvent) => {
                // Message data is received as a string
                try {
                    const broadcastEvent = JSON.parse(
                        event.data
                    ) as MessageFromServerToExtension;
                    this.handleServerMessage(broadcastEvent);
                } catch (e) {
                    log(
                        `Message received from the server (>>${event.data}<<) is not interpretable as JSON:`,
                        e
                    );
                }
            };

            this.webSocket.onclose = () => {};
        });
    }

    public ensureOpened(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.getWebSocket()) {
                this.connect().then(() => resolve());
                return;
            }
            switch (this.getWebSocket().readyState) {
                case WebSocket.OPEN: {
                    resolve();
                    break;
                }
                case WebSocket.CONNECTING: {
                    // TODO : wait some time, retry, with a maximum nb of retries
                    throw new Error("NotImplemented: websocket was connecting");
                }
                case WebSocket.CLOSING: {
                    // TODO wait until closed, then reopen, with max number of retries
                    throw new Error("NotImplemented: websocket was closing");
                }
                case WebSocket.CLOSED: {
                    this.connect().then(() => resolve());
                    break;
                }
            }
        });
    }

    public send(message: any) {
        this.ensureOpened().then(() => this.webSocket.send(message));
    }

    private handleServerMessage(broadcastEvent: MessageFromServerToExtension) {
        log("Received from backend the following event: ", broadcastEvent);
        this.serverMessageHandler(broadcastEvent);
    }

    public close() {
        if (this.webSocket) {
            this.webSocket.close();
        }
    }
}
