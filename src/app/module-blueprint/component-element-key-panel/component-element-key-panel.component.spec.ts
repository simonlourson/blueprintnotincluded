import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentElementKeyPanelComponent } from './component-element-key-panel.component';

describe('ComponentElementKeyPanelComponent', () => {
  let component: ComponentElementKeyPanelComponent;
  let fixture: ComponentFixture<ComponentElementKeyPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentElementKeyPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentElementKeyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
