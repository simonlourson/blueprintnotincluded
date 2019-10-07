import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SaveInfo } from '../common/save-info';

@Component({
  selector: 'app-component-save-dialog',
  templateUrl: './component-save-dialog.component.html',
  styleUrls: ['./component-save-dialog.component.css']
})
export class ComponentSaveDialogComponent implements OnInit {

  visible: boolean = false;

  @Output() onSaveToCloud = new EventEmitter<SaveInfo>();

  username: string;
  blueprintName: string;
  password: string;

  constructor() { }

  ngOnInit() {
  }

  save(event: any)
  {
    console.log('save')

    let saveInfo = new SaveInfo();
    saveInfo.username = this.username;
    saveInfo.blueprintName = this.blueprintName;

    this.onSaveToCloud.emit(saveInfo);
    this.hideDialog();
  }

  cancel(event: any)
  {
    this.hideDialog();
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
