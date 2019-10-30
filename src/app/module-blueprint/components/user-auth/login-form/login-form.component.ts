import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentification-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  @Output() onRegistration = new EventEmitter();
  @Output() onLoginOk = new EventEmitter();

  constructor(private authService: AuthenticationService, private messageService: MessageService) { }

  get f() { return this.loginForm.controls; }
  get icon() { return this.working ? 'pi pi-spin pi-spinner' : ''; }

  working: boolean = false;
  authError: boolean = false;

  ngOnInit() {
  }

  reset()
  {
    this.working = false;
    this.authError = false;
    this.loginForm.reset();
  }

  onSubmit()
  {
    let tokenPayload = {
      email: '',  
      username: this.loginForm.value.username as string,
      password: this.loginForm.value.password as string  
    }

    this.working = true;
    this.authService.login(tokenPayload).subscribe(
      () => {  
        this.onLoginOk.emit();

        let summary: string = 'Login Successful';
        let detail: string = 'Welcome ' + this.authService.getUserDetails().username;

        this.messageService.add({severity:'success', summary:summary , detail:detail});
        this.working = false;
      },
      (err) => { 
        this.authError = true;
        this.working = false;
      }
    );
  }

  registration()
  {
    this.onRegistration.emit();
  }

}
