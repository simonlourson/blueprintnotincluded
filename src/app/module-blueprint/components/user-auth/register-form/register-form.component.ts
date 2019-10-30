import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginInfo } from 'src/app/module-blueprint/common/api/login-info';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CheckDuplicateService } from '../check-duplicate-service';
import { AuthenticationService } from '../authentification-service';
import { MessageService } from 'primeng/api';


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

  @Output() onRegistrationOk = new EventEmitter();

  constructor(private authService: AuthenticationService, private checkDuplicateService: CheckDuplicateService, private messageService: MessageService) { 
  }

  get f() { return this.registerForm.controls; }
  get icon() { return this.working ? 'pi pi-spin pi-spinner' : ''; }

  working: boolean = false;
  authError: boolean = false;
  duplicateError: boolean = false;

  reset()
  {
    this.working = false;
    this.authError = false;
    this.duplicateError = false;
    this.registerForm.reset();
  }

  passwordConfirming(c: AbstractControl): { invalid: boolean } 
  {
    if (c.get('password').value !== c.get('confirmPassword').value) return {invalid: true};
  }

  onSubmit()
  {
    let tokenPayload = {
      email: this.registerForm.value.email as string,
      username: this.registerForm.value.username as string,
      password: this.registerForm.value.password as string  
    }

    this.working = true;
    this.authService.register(tokenPayload).subscribe(
      (data) => {
        if (data.duplicateError) this.duplicateError = true;
        else if (data.token)
        {
          this.onRegistrationOk.emit();
          let summary: string = 'Registration Successful';
          let detail: string = 'Welcome ' + this.authService.getUserDetails().username;
  
          this.messageService.add({severity:'success', summary:summary , detail:detail});
        }

        this.working = false;
      },
      (err) => { 
        this.authError = true;
        this.working = false;
      }
    );

  }

  ngOnInit() {
  }

}
