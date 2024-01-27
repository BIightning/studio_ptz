import { Component, Input, HostBinding, HostListener } from '@angular/core'
import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
    selector: '[collapse]',
    template: '<ng-content></ng-content>',
    animations: [
        trigger('collapse', [
            state('0', style({ height: '0', opacity: '0' })),
            state('1', style({ height: '*', opacity: '1' })),
            transition('0 <=> 1', animate('{{duration}}ms {{easing}}'), {
                params: {
                    duration: 300,
                    easing: "ease-in-out"
                }
            })
        ])
    ],
    standalone: true
})
export class CollapseComponent {
  @HostBinding('@collapse')
  @Input() 
  collapse: boolean = false;
}