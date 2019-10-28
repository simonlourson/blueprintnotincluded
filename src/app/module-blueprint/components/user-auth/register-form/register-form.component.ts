import { Component, OnInit } from '@angular/core';
import { LoginInfo } from 'src/app/module-blueprint/common/api/login-info';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {

  registerForm = new FormGroup({
    email: new FormControl('', Validators.email),
    username: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl('')
  });

  loginInfo: LoginInfo;

  constructor() { 
    this.loginInfo = new LoginInfo();
  }

  onSubmit()
  {
    console.log(this.registerForm)
  }

  ngOnInit() {
  }

  showResponse(event) {
    
  }

}
