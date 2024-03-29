import { Server as WsServer, WebSocket } from 'ws';
import * as http from 'http';
import { Logger } from "../utils/logger.class";
import { Connection } from "./connection.class";

export class WebsocketServer {
    private httpServer: http.Server;
    private wsServer: WsServer;

    connections: Connection[] = [];

    constructor() {
        this.setup();
        Logger.info('Websocket server started');
    }

    private setup() {
        this.httpServer = http.createServer();
        this.httpServer.listen(+process.env.WEBSOCKET_PORT!);
        this.wsServer = new WebSocket.Server({ server: this.httpServer });

        this.wsServer.on('connection', (socket: WebSocket) => {
            this.connections.push(new Connection(socket));
            Logger.info(
                `Websocket server: New connection established. Total connections: ${this.connections.length}`
            );
        });

        // Start pinging connections to check if they are still alive
        setInterval(
            () => this.pingConnections(),
            +process.env.PING_INTERVAL!
        );
    }

    public broadcast(message: string) {
        for (const connection of this.connections)
            connection.Socket.send(message);
    }

    private pingConnections() {
        if (this.connections.length === 0)
            return;

        Logger.debug(`Websocket Pinging ${this.connections.length} connections`);

        for (const connection of this.connections)
            if(!connection.ping())
                this.onDisconnect(connection);
    }


    private onDisconnect(connection: Connection) {
        this.connections.splice(this.connections.indexOf(connection), 1);
        Logger.info(`Websocket server: A connection was closed. Total connections: ${this.connections.length}`);
    }
}