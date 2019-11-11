import { Component, OnInit, Input } from '@angular/core';
import { SameItemCollection } from 'src/app/module-blueprint/common/tools/same-item-collection';

@Component({
  selector: 'app-item-collection-info',
  templateUrl: './item-collection-info.component.html',
  styleUrls: ['./item-collection-info.component.css']
})
export class ItemCollectionInfoComponent implements OnInit {

  nbItems: string;
  @Input() itemCollection: SameItemCollection;

  constructor() { }

  ngOnInit() {
    this.nbItems = this.itemCollection.items.length +  ' item' + (this.itemCollection.items.length > 1 ? 's' : '') + ' selected'
  }

}
