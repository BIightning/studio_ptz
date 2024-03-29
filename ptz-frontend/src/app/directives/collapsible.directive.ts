import { Directive, ElementRef, Input, ViewContainerRef, OnInit, TemplateRef, EmbeddedViewRef } from "@angular/core";
import { AnimationFactory, AnimationBuilder, AnimationPlayer, style, animate } from '@angular/animations';

export class CollapsibleContext {
  $implicit = false;
  destroy = true;
}

@Directive({
    selector: "[collapsible]",
    standalone: true
})
export class CollapsibleDirective implements OnInit {

  private context = new CollapsibleContext();
  private viewRef: EmbeddedViewRef<CollapsibleContext> | null = null;

  private showFactory: AnimationFactory;
  private hideFactory: AnimationFactory;

  private showAnimation: AnimationPlayer;
  private hideAnimation: AnimationPlayer;


  @Input()
  set collapsible(value: boolean) {
    if (this.viewRef) {
      if (value) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  @Input()
  collapsibleDuration = 500;

  @Input()
  collapsibleEasing = 'ease-in-out';

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<CollapsibleContext>,
    private animationBuilder: AnimationBuilder) {
  }

  get duration() {
    return `${this.collapsibleDuration}ms ${this.collapsibleEasing}`;
  }

  ngOnInit() {
    this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context, 0);

    this.showFactory = this.animationBuilder.build([
      style({ height: 0, opacity: 0 }),
      animate(this.duration, style({ height: this.viewRef.rootNodes[0].clientHeight, opacity: 1}))
    ]);

    this.hideFactory = this.animationBuilder.build([
      style({ height: '*', opacity: 1 }),
      animate(this.duration, style({ height: 0, opacity: 0 }))
    ]);
  }

  show() {
    if (this.showAnimation) {
      this.showAnimation.destroy();
    }
    this.showAnimation = this.showFactory.create(this.viewRef?.rootNodes[0]);
    this.showAnimation.play();
  }

  hide() {
    if (this.hideAnimation) {
      this.hideAnimation.destroy();
    }
    this.hideAnimation = this.hideFactory.create(this.viewRef?.rootNodes[0]);
    this.hideAnimation.play();
  }
}