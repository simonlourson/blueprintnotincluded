import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionToolSingleComponent } from './selection-tool-single.component';

describe('SelectionToolSingleComponent', () => {
  let component: SelectionToolSingleComponent;
  let fixture: ComponentFixture<SelectionToolSingleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionToolSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionToolSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
