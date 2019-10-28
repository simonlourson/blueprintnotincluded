import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { LoginInfo } from '../../../common/api/login-info';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class ComponentLoginDialogComponent implements OnInit {

  visible: boolean = false;
  
  @ViewChild('loginDialog', {static: true}) loginDialog: Dialog

  @Output() onLogin = new EventEmitter<LoginInfo>();

  constructor() { 
    
  }

  ngOnInit() {
  }

  cancel(event: any)
  {
    this.hideDialog();
  }

  showDialog()
  {
    this.visible = true;
    this.recenter();
  }

  hideDialog()
  {
    this.visible = false;
  }

  login()
  {
    //this.onLogin.emit(this.loginInfo);
  }

  transformRegister()
  {
    //this.loginInfo.registration = true;

    this.recenter();
  }

  recenter()
  {
    setTimeout(() => {this.loginDialog.positionOverlay();}, 0)
  }

}
