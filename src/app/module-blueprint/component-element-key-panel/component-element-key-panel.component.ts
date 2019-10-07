import { Component, OnInit } from '@angular/core';
import { OniItem } from '../common/oni-item';
import { ComposingElement } from '../common/composing-element';

@Component({
  selector: 'app-component-element-key-panel',
  templateUrl: './component-element-key-panel.component.html',
  styleUrls: ['./component-element-key-panel.component.css']
})
export class ComponentElementKeyPanelComponent implements OnInit {

  distinctElements: ComposingElement[];
  visible: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  showDialog()
  {
    this.visible = true;
  }

  hideDialog()
  {
    this.visible = false;
  }

}
