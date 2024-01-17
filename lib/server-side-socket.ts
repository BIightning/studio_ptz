import { WebSocket } from 'ws';
import { WebsocketEvent } from "./websocket-event.type";
import { IWebSocket } from './websocket.interface';

/**
 * A minimalistic websocket client for use on server
 * side. It is used to communicate with the frontend
 * via websockets.
 * 
 * It is used by the WebsocketServer class.
 * 
 * @param socket The websocket to use
 * @param role The role of the socket. Either 'client' or 'server'.
 * If the role is 'client' the socket will try to connect to a server.
 * If the role is 'server' the socket represents a connection to a client.
 * 
 * @author Johannes Franzen
 */
export class ServerSideSocket implements IWebSocket {

    private socket: WebSocket;
    private callbacks: Map<string, { callback: Function, bOnce: boolean }>;

    pingTimeout: any;
    bIsAlive: boolean = true;


    constructor(
        socket: WebSocket,
        role: 'client' | 'server',
        private HANDSHAKE_TIMEOUT = 3500,
        private CONNECTION_TIMEOUT = 10000
    ) {
        this.socket = socket;
        this.callbacks = new Map<string, { callback: Function, bOnce: boolean }>();
        this.registerKeyEvents();

        if (role === 'client') {
            this.resetConnectionTimeout();
            this.heartbeat();
            return;
        }

        this.on('client::pong', () => this.bIsAlive = true);
    }

    public registerKeyEvents(): void {
        this.socket.onopen = () => this.trigger('socket::open', () => { });

        this.socket.onclose = () => this.trigger('socket::close', null);

        this.socket.onmessage = ({ data }) => this.onMessage(data as string);

        this.socket.onerror = (e) => this.trigger('socket::error', e);
    }

    /**
     * Tries to parse the incoming message to an js Object
     * @param message 
     */
    private onMessage(message: string): void {
        if (!message)
            return;

        try { 
            const parsed = JSON.parse(message); 
            if (parsed === null) {
                this.trigger('socket::error', new Error(`Could not parse incoming message.\n Message: "${message}"`));
                return;
            }
    
            this.trigger(parsed.event, parsed.payload);
        
        }
        catch (error: any) {
            this.trigger('socket::error', error);
        }

    }


    public on(eventName: string, callback: Function): void {
        this.callbacks.set(eventName, { callback, bOnce: false });
    }

    public once(eventName: string, callback: Function): void {
        this.callbacks.set(eventName, { callback, bOnce: true });
    }

    public unbind(eventName: string): void {
        this.callbacks.delete(eventName);
    }

    public send(eventName: string, payload?: any): void {

        if (payload && payload !== Object(payload))
            throw new Error('A Payload needs to be an object');

        const event = JSON.stringify({ event: eventName, payload });
        this.socket.send(event);
    }

    public sendAndAwaitAnswer<T>(event: WebsocketEvent<T>, awaitedEventName: string, timeout: number = this.HANDSHAKE_TIMEOUT): Promise<T> {
        return new Promise((resolve, reject) => {
            //Register a timeout that clears the handler of the awaited event and rejects the promise
            const requestTimeout = setTimeout(
                () => {
                    this.unbind(awaitedEventName);
                    reject(`Timeout.\nRemote did not respond to event ${event.eventName} in ${timeout / 1000} seconds.`);
                },
                timeout
            );

            this.send(event.eventName, event.payload);
            this.once(awaitedEventName, (data: T) => {
                resolve(data);
                clearTimeout(requestTimeout);
            });
        });
    }

    public close(): void {
        this.socket.close();
        this.trigger('socket::closed', null);
    }

    /**
     * Searches for the event with the given name and triggers it with the
     * given data as parameter
     * @param eventName 
     * @param payload 
     */
    private trigger(eventName: string, payload: object | null): void {
        let event = this.callbacks.get(eventName);
        if (!event)
            return;
        event.callback(payload);

        if (event.bOnce)
            this.unbind(eventName);
    }

    /**
     * Listens to the server's ping event & answers.
     * Also calls resetConnectionTimeout to prevent socket from closing
     * if ping is received in time
     */
    private heartbeat() {
        this.on('server::ping', () => {
            this.send('client::pong');
            this.resetConnectionTimeout();
        });
    }

    /**
     * Pings remote to check if connection is still alive
     * @returns false if we lost connection to remote, true if connection is still alive
     */
    public ping(): boolean {
        if (!this.bIsAlive)
            return false;

        this.bIsAlive = false;
        this.send('server::ping');
        return true;
    }

    /**
     * Resets the timeout that closes the connection.
     */
    private resetConnectionTimeout(): void {
        if (this.pingTimeout)
            clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(
            () => this.close(),
            this.CONNECTION_TIMEOUT
        );
    }
}