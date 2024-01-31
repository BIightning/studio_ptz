import { Injectable } from '@angular/core';
import { WebSocketClient } from '../models/websocketclient';
import { WebsocketEvent } from '../models/websocket-event.type';
import asyncCall from '../models/async-call.util';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: WebSocketClient;

  constructor() {
    this.socket = new WebSocketClient('ws://192.168.0.64:7777');
  }

  // public abstract connect(): void | Promise<void>

  public send(eventName: string, payload?: any) {
    this.socket.send(eventName, payload);
  }

  public request<T>(event: WebsocketEvent<any>, awaitedEventKey: string, timeout? : number) {
    return asyncCall(this.socket.request<T>(event, awaitedEventKey, timeout));
  }

  public on(eventName: string, callback: Function): void {
    this.socket.on(eventName, callback);
  }

  public once(eventName: string, callback: Function): void {
    this.socket.once(eventName, callback);
  }

  public unbind(...eventName: string[]): void {
    for(let event of eventName)
      this.socket.unbind(event);
  }
}
