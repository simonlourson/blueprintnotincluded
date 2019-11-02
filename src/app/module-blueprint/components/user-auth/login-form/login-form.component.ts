import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentification-service';
import { MessageService } from 'primeng/api';
import { ReCaptchaV3Service } from 'ng-recaptcha';  
import { Observable, Subscription } from 'rxjs';
import { ToolRequest } from 'src/app/module-blueprint/common/tool-request';

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

  constructor(
    private authService: AuthenticationService, 
    private recaptchaV3Service: ReCaptchaV3Service,
    private messageService: MessageService) { }

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

  subscription: Subscription;
  onSubmit()
  {
    this.working = true;
    this.subscription = this.recaptchaV3Service.execute('login').subscribe((token) => {

      let tokenPayload = {
        'g-recaptcha-response': token,
        email: '',  
        username: this.loginForm.value.username as string,
        password: this.loginForm.value.password as string  
      }
      
      this.authService.login(tokenPayload).subscribe({
        next: this.handleSaveNext.bind(this),
        error: this.handleSaveError.bind(this)
      });
      
      this.subscription.unsubscribe();

    });
  }

  handleSaveNext(response: any)
  {
    this.onLoginOk.emit();

    let summary: string = 'Login Successful';
    let detail: string = 'Welcome ' + this.authService.getUserDetails().username;

    this.messageService.add({severity:'success', summary:summary , detail:detail});
    this.working = false;
  }

  handleSaveError()
  {
    this.authError = true;
    this.working = false;
  }

  registration()
  {
    this.onRegistration.emit();
  }

}
