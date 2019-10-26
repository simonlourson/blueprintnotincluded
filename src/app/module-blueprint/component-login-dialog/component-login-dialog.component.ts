import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginInfo } from '../common/api/login-info';

@Component({
  selector: 'app-component-login-dialog',
  templateUrl: './component-login-dialog.component.html',
  styleUrls: ['./component-login-dialog.component.css']
})
export class ComponentLoginDialogComponent implements OnInit {

  visible: boolean = false;

  loginInfo: LoginInfo;

  @Output() onLogin = new EventEmitter<LoginInfo>();

  constructor() { 
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
  }

  hideDialog()
  {
    this.visible = false;
  }

  login()
  {
    this.onLogin.emit(this.loginInfo);
  }

}
