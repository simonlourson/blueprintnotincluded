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
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required], [this.checkDuplicateService.usernameValidator()]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  }, {validators:[this.passwordConfirming]});

  constructor(private http: HttpClient, private checkDuplicateService: CheckDuplicateService) { 
  }

  get f() { return this.registerForm.controls; }

  passwordConfirming(c: AbstractControl): { invalid: boolean } 
  {
    if (c.get('password').value !== c.get('confirmPassword').value) return {invalid: true};
  }

  onSubmit()
  {
    console.log(this.registerForm)
    this.http.post('/api/register', this.registerForm.value).subscribe();
  }

  ngOnInit() {
  }

  showResponse(event) {
    
  }

}
