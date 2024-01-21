import { Component } from '@angular/core';
import { XkeysService } from '../services/xkeys.service';
import { Subscription } from 'rxjs';
import { DeviceInfo } from '../models/device-info.interface';

@Component({
  selector: 'app-controller',
  standalone: true,
  imports: [],
  templateUrl: './controller.component.html',
  styleUrl: './controller.component.scss'
})
export class ControllerComponent {
  xkeysConnectedSub: Subscription | null = null;
  bXkeysConnected: boolean = false;
  deviceInfo: DeviceInfo | undefined;

  constructor(private readonly xkeysService: XkeysService) {}

  ngOnInit() {
    this.xkeysConnectedSub = this.xkeysService.xkeysConnected$
      .subscribe((bConnected) => {
        this.bXkeysConnected = bConnected;
        this.deviceInfo = this.xkeysService.deviceInfo;
      });
  }
    
  connect() {
    this.xkeysService.setup();
  }
}
