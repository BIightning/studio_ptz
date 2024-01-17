
import { WebsocketEvent } from "./websocket-event.type";
import { IWebSocket } from "./websocket.interface";

/**
 * A minimalistic websocket client for use in browser
 * @author Johannes Franzen
 */
export class WebSocketClient implements IWebSocket {

    private socket: WebSocket;
    private callbacks: Map<string, { callback: Function, bOnce: boolean }>;
    private _bConnected: boolean;
    private messageBuffer: string[];

    private pingTimeout: any;
    private handshakeTimeout: any;

    get bConnected(): boolean {
        return this._bConnected;
    }

    constructor(
        url: string,
        private HANDSHAKE_TIMEOUT = 3500,
        private CONNECTION_TIMEOUT = 10000
    ) {
        this.callbacks = new Map<string, { callback: Function, bOnce: boolean }>();
        this.pingTimeout = null;
        this.messageBuffer = [];
        this._bConnected = false;

        this.socket = new WebSocket(url);
        this.registerKeyEvents();
        this.setHandshakeTimeout();
    }


    /**
     * Registers an event that fires when the websocket connects successfully
     */
    onConnect(): void {

        console.log('Websocket connection established!');
        this._bConnected = true;

        this.sendBufferedMessages();
        clearTimeout(this.handshakeTimeout);
        this.heartbeat();
        this.resetConnectionTimeout();

    }

    /**
     * Sends all buffered messages to the server
     */
    private sendBufferedMessages(): void {
        for (const message of this.messageBuffer) {

            this.socket.send(message);
        }
    }

    public registerKeyEvents(): void {
        this.socket.onopen = () => this.onConnect();

        this.socket.onclose = () => this.trigger('socket::closed', null);

        this.socket.onmessage = ({ data }) => this.onMessage(data as string);

        this.socket.onerror = (e) => this.trigger('socket::error', e);
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

    /**
     * Emits a custom event.
     * If the socket is not yet connected, the event will be stored in a buffer.
     * @param eventName 
     * @param payload optional data to send. Can be any js object literal
     */
    public send(eventName: string, payload?: any): void {
        if (payload && payload !== Object(payload))
            throw new Error('A Payload needs to be an object');

        const event = JSON.stringify({ event: eventName, payload });
        if (this._bConnected)
            this.socket.send(event);
        else
            this.messageBuffer.push(event);
    }

    public sendAndAwaitAnswer<T>(event: WebsocketEvent<T>, awaitedEventName: string, timeout: number = this.HANDSHAKE_TIMEOUT): Promise<T> {
        return new Promise((resolve, reject) => {
            //Register a timeout that clears the handler of the awaited event and rejects the promise
            const requestTimeout = setTimeout(
                () => {
                    this.unbind(awaitedEventName);
                    reject(`Timeout.\nServer did not respond to event ${event.eventName} in ${timeout / 1000} seconds.\n${JSON.stringify(event)}`);
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

    /**
     * Tries to parse the incoming message to an js Object
     * @param message 
     */
    private onMessage(message: string): void {
        if (!message)
            return;

        try {
            const parsed = JSON.parse(message);
            this.trigger(parsed.event, parsed.payload);
        }
        catch (error: any) {
            this.trigger('socket::error', error);
        }
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
     * Resets the timeout that closes the connection.
     * If timeout gets executed, the socket is closed & 
     * a 'server::unreachable' event is triggered
     */
    private resetConnectionTimeout(): void {
        if (this.pingTimeout)
            clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(() => {
            this.close();
        }, this.CONNECTION_TIMEOUT);
    }

    /**
     * Sets a timeout that closes the socket after the predefined
     * interval.
     */
    private setHandshakeTimeout(): void {
        this.handshakeTimeout = setTimeout(
            () => this.close(),
            this.HANDSHAKE_TIMEOUT
        );
    }

    public close() {
        this._bConnected = false;
        this.socket.close();
        this.trigger('socket::closed', null);
    }
}
