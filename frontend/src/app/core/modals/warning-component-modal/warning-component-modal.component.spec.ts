import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningComponentModalComponent } from './warning-component-modal.component';

describe('WarningComponentModalComponent', () => {
  let component: WarningComponentModalComponent;
  let fixture: ComponentFixture<WarningComponentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarningComponentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningComponentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
