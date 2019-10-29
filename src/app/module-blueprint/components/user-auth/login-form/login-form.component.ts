import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) { }

  get f() { return this.loginForm.controls; }

  ngOnInit() {
  }

  onSubmit()
  {
    console.log(this.loginForm)
    this.http.post('/api/login', this.loginForm.value).subscribe();
  }

}
