import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildableElementDropdownComponent } from './buildable-element-dropdown.component';

describe('BuildableElementDropdownComponent', () => {
  let component: BuildableElementDropdownComponent;
  let fixture: ComponentFixture<BuildableElementDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildableElementDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildableElementDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
