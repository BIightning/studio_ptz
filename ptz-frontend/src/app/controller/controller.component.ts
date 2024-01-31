import { Component, OnDestroy, OnInit } from '@angular/core';
import { XkeysService } from '../services/xkeys.service';
import { Subscription } from 'rxjs';
import { DeviceInfo } from '../models/device-info.interface';
import { GamepadService } from '../services/gamepad.service';

@Component({
  selector: 'app-controller',
  standalone: true,
  imports: [],
  templateUrl: './controller.component.html',
  styleUrl: './controller.component.scss'
})
export class ControllerComponent implements OnInit, OnDestroy {

  bXkeysConnected: boolean = false;
  bGamePadConnected: boolean = false;
  deviceInfo: DeviceInfo | undefined;

  gamepadConnectedSub: Subscription | null = null;
  xkeysConnectedSub: Subscription | null = null;

  constructor(
    private readonly xkeysService: XkeysService,
    private readonly gamepadService: GamepadService
  ) {}

  ngOnInit() {
    this.xkeysConnectedSub = this.xkeysService.xkeysConnected$
      .subscribe((bConnected) => {
        this.bXkeysConnected = bConnected;
        this.deviceInfo = this.xkeysService.deviceInfo;
      });

    this.gamepadConnectedSub = this.gamepadService.gamepadConnectStatus
      .subscribe((bConnected) => this.bGamePadConnected = bConnected);
  }

  ngOnDestroy() {
    this.xkeysConnectedSub?.unsubscribe();
    this.gamepadConnectedSub?.unsubscribe();
  }
    
  connectXkeys() {
    this.xkeysService.setup();
  }

  connectGamePad() {
    this.gamepadService.setupGamepad();
  }
}
