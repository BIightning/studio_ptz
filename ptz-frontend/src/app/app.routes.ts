import { Routes } from '@angular/router';
import { ControllerComponent } from './controller/controller.component';
import { InfoComponent } from './info/info.component';

export const routes: Routes = [
    {
        'path': 'controller',
        component: ControllerComponent
    },
    {
        'path': 'settings',
        loadComponent: () => import('./settings/settings.component').then(c => c.SettingsComponent)
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
