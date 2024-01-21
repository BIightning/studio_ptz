import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { JoystickValueEmit, XKeys, getOpenedXKeysPanels, requestXkeysPanels, setupXkeysPanel } from 'xkeys-webhid';
import asyncCall from '../models/async-call.util';
import { BehaviorSubject } from 'rxjs';
import { DeviceInfo } from '../models/device-info.interface';

@Injectable({
  providedIn: 'root'
})
export class XkeysService {

  private currentXkeys: XKeys | null = null;
  xkeysConnected$: BehaviorSubject<boolean>;

  public get deviceInfo(): DeviceInfo | undefined {
    return this.currentXkeys?._getDeviceInfo();
  }

  constructor(private readonly websocketService: WebsocketService) {
    this.xkeysConnected$ = new BehaviorSubject<boolean>(false);
  }

  /**
   * Setup XKeys
   */
  public async setup() {
    //Try to get previously opened XKeys panels
    const { error, result } = await asyncCall(getOpenedXKeysPanels());

    if (error) {
      console.error(error);
      return;
    }

    if (result.length > 0) {
      this.setupPanel(result[0]); //We only support one panel at the moment
      return;
    }


    //No previously opened panels found, request new ones
    this.requestXkeys();
  }


  /**
   * Request XKeys panels from the user
   * @returns 
   */
  private async requestXkeys() {
    const { error, result } = await asyncCall(requestXkeysPanels());
    if (error) {
      console.error(error); //todo: handle error
      return;
    }

    if (!result || result.length === 0) {
      console.error('No XKeys panels found'); //todo: handle error
      return;
    }

    this.setupPanel(result[0]);
  }


  private async setupPanel(device: HIDDevice) {
    const { error, result } = await asyncCall(setupXkeysPanel(device));

    if (error) {
      console.error(error);
      return;
    }

    this.currentXkeys = result;

    //Message the server that we have connected to a XKeys panel
    //And wait for confirmation
    const { error: confirmError } = await asyncCall(
      this.websocketService.request(
        { eventName: 'client::xkeys-connect', payload: this.currentXkeys._getDeviceInfo() },
        'server::xkeys-connect-confirm'
      ));

    if (confirmError) {
      console.error(confirmError);
      return;
    }

    this.registerXKeyEvents();
    this.xkeysConnected$.next(true);
  }


  private async registerXKeyEvents() {
    if (!this.currentXkeys)
      return;


    this.currentXkeys.on('down', (keyIndex: number) => {
      this.websocketService.send('client::xkeys-keydown', { keyIndex });
    });

    this.currentXkeys.on('up', (keyIndex: number) =>
      this.websocketService.send('client::xkeys-keyup', { keyIndex })
    );

    //We currently only support one joystick
    this.currentXkeys.on('joystick', (_: number, value: JoystickValueEmit) =>
      this.websocketService.send('client::xkeys-joystick', value)
    );

    this.currentXkeys.on('disconnected', () => {
      console.log('XKeys disconnected');
      this.websocketService.send('client::xkeys-disconnect');
      this.xkeysConnected$.next(false);
    });

    this.currentXkeys.on('error', (err: any) => console.error(err));

  }
}
