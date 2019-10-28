import { Component, OnInit } from '@angular/core';
import { LoginInfo } from 'src/app/module-blueprint/common/api/login-info';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CheckDuplicateService } from '../check-duplicate-service';


@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {

  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email], [this.checkDuplicateService.emailValidator()]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  }, {validators:[this.passwordConfirming]});

  loginInfo: LoginInfo;

  constructor(private http: HttpClient, private checkDuplicateService: CheckDuplicateService) { 
    this.loginInfo = new LoginInfo();
  }

  get f() { return this.registerForm.controls; }

  passwordConfirming(c: AbstractControl): { invalid: boolean } 
  {
    if (c.get('password').value !== c.get('confirmPassword').value) return {invalid: true};
  }

  checkUsedEmail(c: AbstractControl): { invalid: boolean } 
  {
    let tentativeEmail = {tentativeEmail: c.get('email').value};
    console.log(tentativeEmail);
    this.http.post('/api/checkemail', tentativeEmail).subscribe();

    if (tentativeEmail.tentativeEmail=='') return {invalid: true};
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
