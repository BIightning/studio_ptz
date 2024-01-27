import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraGroupComponent } from './camera-group.component';

describe('CameraGroupComponent', () => {
  let component: CameraGroupComponent;
  let fixture: ComponentFixture<CameraGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CameraGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
