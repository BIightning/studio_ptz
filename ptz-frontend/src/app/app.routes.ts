import { Routes } from '@angular/router';
import { ControllerComponent } from './controller/controller.component';
import { InfoComponent } from './info/info.component';
import { CameraGroup } from './settings/models/camera-group.class';
import { CameraGroupComponent } from './settings/camera-group/camera-group.component';

export const routes: Routes = [
    {
        'path': 'controller',
        component: ControllerComponent
    },
    {
        'path': 'settings',
        loadComponent: () => import('./settings/settings.component').then(c => c.SettingsComponent),
    },
    {
        path: 'camera-group/:id',
        component: CameraGroupComponent,
    },
    {
        'path': 'info',
        component: InfoComponent
    },
    {
        'path': '**',
        redirectTo: 'controller'
    }
];
