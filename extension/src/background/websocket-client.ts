import {
    BroadcastEvent,
    BroadcastEventType,
} from "../../../backend/libs/response";

export default class WebSocketClient {
    private host: string;
    private webSocket!: WebSocket;

    public constructor(host: string) {
        this.host = host;
    }

    public getWebSocket(): WebSocket {
        return this.webSocket;
    }

    public connect(): Promise<void> {
        return new Promise((resolve) => {
            this.webSocket = new WebSocket(this.host);

            this.webSocket.onopen = () => {
                this.webSocket.send(
                    JSON.stringify({ message: "[WS-E] Connected to server" })
                );
                resolve();
            };

            this.webSocket.onmessage = (event: MessageEvent) => {
                // Since the messages are supposed to be in JSON format, should be: JSON.parse(event.data)
                const broadcastEvent = event.data as BroadcastEvent;
                switch (broadcastEvent.type) {
                    case BroadcastEventType.NEW_WATCHER:
                        console.log(`A new watcher joined`);
                        break;

                    default:
                        break;
                }

                console.log(`[WS-S] ${broadcastEvent}`);
            };

            this.webSocket.onclose = () => {};
        });
    }

    public ensureOpened(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.webSocket) {
                this.connect().then(() => resolve());
                return;
            }
            switch (this.webSocket.readyState) {
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

    public close() {
        if (this.webSocket) {
            this.webSocket.close();
        }
    }
}
