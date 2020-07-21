import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { BuildableElement } from '../../../../../../../blueprintnotincluded-lib/index';

@Component({
  selector: 'app-cell-element-picker',
  templateUrl: './cell-element-picker.component.html',
  styleUrls: ['./cell-element-picker.component.css']
})
export class CellElementPickerComponent implements OnInit {

  filterNameSubject = new Subject<string>();
  filterName: string;

  selectedTags: string[] = ['Gas', 'Liquid'];
  elements: BuildableElement[];

  @Output() onSelectElement = new EventEmitter<BuildableElement>();

  constructor() { 

    this.filterNameSubject.subscribe(value => {
      this.filter();
    });

  }

  ngOnInit() {
    this.filterElements();
  }

  filter() {
    this.filterElements();
  }

  tagChanged(event: any) {
    this.filterElements();
  }

  filterElements() {
    this.elements = [];
    for (let element of BuildableElement.elements) {

      let addToList = false;

      let filterString = false;
      let filterTag = false;
      let filterMissing = true;

      for (let tag of this.selectedTags)
        if (element.hasTag(tag)) filterTag = true;

      if (this.filterName == null || this.filterName == '') filterString = true;
      else if (element.name.toUpperCase().indexOf(this.filterName.toUpperCase()) != -1) filterString = true;

      if (element.name.indexOf('MISSING') != -1) filterMissing = false;

      if (filterString && filterTag && filterMissing) this.elements.push(element);
    }
  }

  selectElement(element: BuildableElement) {
    this.onSelectElement.emit(element);
  }
}
