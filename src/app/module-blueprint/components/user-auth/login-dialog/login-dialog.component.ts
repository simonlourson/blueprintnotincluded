import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { LoginInfo } from '../../../common/api/login-info';
import { Dialog } from 'primeng/dialog';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class ComponentLoginDialogComponent implements OnInit {

  visible: boolean = false;
  loginType: LoginType = LoginType.Login;
  
  @ViewChild('loginDialog', {static: true}) loginDialog: Dialog
  @ViewChild('loginForm', {static: false}) loginForm: LoginFormComponent
  @ViewChild('registerForm', {static: false}) registerForm: RegisterFormComponent

  constructor(private cdRef: ChangeDetectorRef) { 
    
  }

  ngOnInit() {
  }

  cancel(event: any)
  {
    this.hideDialog();
  }

  showDialog()
  {
    this.loginType = LoginType.Login;
    this.cdRef.detectChanges();

    this.loginForm.reset();
    this.visible = true;
    this.recenter();
  }

  hideDialog()
  {
    this.visible = false;
  }

  get isLogin(): boolean { return this.loginType == LoginType.Login; }
  get isRegistration(): boolean { return this.loginType == LoginType.Registration; }

  registration()
  {
    this.loginType = LoginType.Registration;
    this.cdRef.detectChanges();

    this.registerForm.reset();
    this.recenter();
  }

  recenter()
  {
    setTimeout(() => {this.loginDialog.positionOverlay();}, 0)
  }

}

enum LoginType
{
  Login,
  Registration,
  ForgotPassword
}