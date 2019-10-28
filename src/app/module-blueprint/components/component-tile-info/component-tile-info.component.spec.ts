import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentTileInfoComponent } from './component-tile-info.component';

describe('ComponentTileInfoComponent', () => {
  let component: ComponentTileInfoComponent;
  let fixture: ComponentFixture<ComponentTileInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentTileInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentTileInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
