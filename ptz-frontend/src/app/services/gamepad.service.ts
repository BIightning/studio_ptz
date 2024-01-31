import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject } from 'rxjs';
import asyncCall from '../models/async-call.util';
import { cp } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class GamepadService {

  private gamepadConnectStatus$ = new BehaviorSubject<boolean>(false);
  currentGamepad: Gamepad | null = null;
  counter: number;
  lastX: number = -2; //Set to -2 (out óf range) to force the first update
  lastY: number = -2; 

  get gamepadConnectStatus() {
    return this.gamepadConnectStatus$.asObservable();
  }

  constructor(private readonly websocketService: WebsocketService) {
  }

  
  public async setupGamepad() {
    console.log('setupGamepad');
    if(!navigator.getGamepads()[0]) //Only works in Chrome
      return;

    //Inform the server that a gamepad has connected
    const { error } = await asyncCall(this.websocketService.request(
      { eventName: "client::gamepad-connect"},
      'server::gamepad-connect-confirm'
    ));

    if(error) {
      console.error(error);
      return;
    }

    this.gamepadConnectStatus$.next(true);
    window.requestAnimationFrame(()=>this.gamepadLoop());
  }

  gamepadLoop(): void {
    const gamepad = navigator.getGamepads()[0];

    if(!gamepad) {
      this.gamepadConnectStatus$.next(false);
      return;
    }

    if(gamepad.axes[0] !== this.lastX || gamepad.axes[1] !== this.lastY) {
      this.websocketService.send(
        'client::gamepad-joystick', 
        { x: gamepad.axes[0], y: gamepad.axes[1] }
      );
    }

    this.lastX = gamepad.axes[0];
    this.lastY = gamepad.axes[1];

    window.requestAnimationFrame(()=>this.gamepadLoop());
  }
}
