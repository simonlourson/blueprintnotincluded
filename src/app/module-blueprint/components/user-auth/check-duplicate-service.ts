import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class CheckDuplicateService
{
  constructor(private http: HttpClient) {}

  public checkEmail(email: string) {
    console.log('checkEmail :'+email);
    
    return timer(1000)
      .pipe(
        switchMap(() => {
          // Check if username is available
          return this.http.get<any>('/api/checkemail?email='+email);
        })
      );
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return this.checkEmail(control.value)
        .pipe(
          map(res => {
            console.log(res)
            // if username is already taken
            if (res.emailPresent) {
              // return error
              return { 'emailExists': true};
            }
          })
        );
    };

  }
}