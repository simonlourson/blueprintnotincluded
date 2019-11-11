import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionToolMultipleComponent } from './selection-tool-multiple.component';

describe('SelectionToolMultipleComponent', () => {
  let component: SelectionToolMultipleComponent;
  let fixture: ComponentFixture<SelectionToolMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionToolMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionToolMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
