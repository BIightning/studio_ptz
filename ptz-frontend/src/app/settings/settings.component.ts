import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../services/websocket.service';
import { CameraGroup } from './models/camera-group.class';
import { Router } from '@angular/router';
import { CameraGroupComponent } from './camera-group/camera-group.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CameraGroupComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  public newGroupName: string = '';
  public cameraGroups: CameraGroup[] = [];

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly router: Router,
    private readonly toastService: ToastrService
  ) { }

  async ngOnInit() {
    const { error, result } = await this.websocketService.request<CameraGroup[]>(
      { eventName: 'client::cameragroups-get' },
      'server::cameragroups-get'
    );

    if (error) {
      console.error(error);
      return;
    }

    this.cameraGroups = result;
    console.log(this.cameraGroups);
  }

  async addGroup() {
    if (this.newGroupName === '')
      return;

    const { error, result } = await this.websocketService.request<any>(
      { eventName: 'client::cameragroup-create', payload: { name: this.newGroupName } },
      'server::cameragroup-create-response'
    );

    this.newGroupName = '';

    if (error) {

      this.toastService.error(error as any, 'Fehler');
      return;
    }


    if (result.success !== true) {

      switch (result.message) {
        case 'CAM_GROUP_NAME_EXISTS':
          this.toastService.error('Eine Gruppe mit diesem Namen existiert bereits.', 'Fehler');
          break;
        case 'MAX_CAM_GROUPS_REACHED':
          this.toastService.error('Die maximale Anzahl an Gruppen wurde erreicht.', 'Fehler');
          break;
        default:
          this.toastService.error('Ein unbekannter Fehler ist aufgetreten.', 'Fehler');
          break;
      }
      return;
    }


    this.cameraGroups = result;
  }

  onGroupClick(group: CameraGroup) {
    this.router.navigate(['/camera-group', group.id], { state: { group } });
  }
}
