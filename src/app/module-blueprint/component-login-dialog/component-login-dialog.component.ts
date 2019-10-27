import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { LoginInfo } from '../common/api/login-info';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-component-login-dialog',
  templateUrl: './component-login-dialog.component.html',
  styleUrls: ['./component-login-dialog.component.css']
})
export class ComponentLoginDialogComponent implements OnInit {

  visible: boolean = false;
  
  registration: boolean
  loginInfo: LoginInfo;

  @ViewChild('loginDialog', {static: true}) loginDialog: Dialog

  @Output() onLogin = new EventEmitter<LoginInfo>();

  constructor() { 
    this.registration = false;
    this.loginInfo = new LoginInfo();
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
    this.registration = false;
    this.recenter();
  }

  hideDialog()
  {
    this.visible = false;
  }

  login()
  {
    this.onLogin.emit(this.loginInfo);
  }

  transformRegister()
  {
    this.registration = true;

    this.recenter();
  }

  recenter()
  {
    setTimeout(() => {this.loginDialog.positionOverlay();}, 0)
  }

}
