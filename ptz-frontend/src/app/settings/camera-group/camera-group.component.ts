import { Component, Input } from '@angular/core';
import { CameraGroup } from '../models/camera-group.class';
import { ActivatedRoute, Router } from '@angular/router';
import { CollapseComponent } from '../../directives/collapse.directive';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-camera-group',
  standalone: true,
  imports: [CollapseComponent, FormsModule],
  templateUrl: './camera-group.component.html',
  styleUrl: './camera-group.component.scss'
})
export class CameraGroupComponent {
  cameraGroup: CameraGroup | undefined;
  newCameraName: string = '';

  constructor(
    private readonly webSocketService: WebsocketService,
    private readonly router: Router,
    private readonly toastService: ToastrService
  ) {
    this.cameraGroup = history.state.group;


    if(!this.cameraGroup) {
      this.router.navigate(['/settings']);
      this.toastService.error('Kameragruppe nicht gefunden.', 'Fehler');
      return;
    }

    console.log(history.state)
    console.log(this.cameraGroup);
  }

  addCamera() {
    if (this.newCameraName.length === 0)
      return;
  
    
  }
    
}
