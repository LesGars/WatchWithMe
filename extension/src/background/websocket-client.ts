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
                    JSON.stringify({ message: "[WS] Connected to server" })
                );
                resolve();
            };
            this.webSocket.onclose = () => {};
        });
    }

    public close() {
        if (this.webSocket) {
            this.webSocket.close();
        }
    }
}
