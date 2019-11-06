import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSidepanelComponent } from './side-panel.component';

describe('ComponentSidepanelComponent', () => {
  let component: ComponentSidepanelComponent;
  let fixture: ComponentFixture<ComponentSidepanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSidepanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSidepanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
