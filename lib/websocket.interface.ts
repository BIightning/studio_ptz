import { WebsocketEvent } from "./websocket-event.type";
export interface IWebSocket {

    /**
     * Binds the event handlers for WebSockets.
     * Most importantly binds the onmessage handler
     * our custom event handler
     */
    registerKeyEvents(): void

    // onMessage(message: string): void

    /**
     * Registers a new custom event listener
     * @param eventName 
     * @param callback The callback function that is called when event is triggered
     */
    on(eventName: string, callback: Function): void

    /**
     * Registers a new custom event listener that only triggers one time and then deletes itself.
     * @param eventName 
     * @param callback The callback function that is called when event is triggered
     */
    once(eventName: string, callback: Function): void

    /**
     * Deletes the custom event listener with the given name
     * @param eventName 
     */
    unbind(eventName: string): void

    /**
     * Emits a custom event.
     * @param eventName 
     * @param payload optional data to send. Can be any js object literal
     */
    send(eventName: string, payload?: any): void

    /**
     * Sends an event and returns a promise that resolves when the servers answers with the specified event name.
     * @param event The name and the payload of the event we want to set
     * @param awaitedEventName The name of the event we want to await
     * @param timeout The time in ms we want to wait for an answer before rejecting.
     * @returns The payload of the awaited event. 
     */
    sendAndAwaitAnswer<T>(event: WebsocketEvent<T>, awaitedEventName: string, timeout?: number): Promise<T>

    // trigger(eventName: string, payload: object | null): void

    /**
     * Closes the socket and emits the 'socket::closed' event.
     */
    close(): void

}