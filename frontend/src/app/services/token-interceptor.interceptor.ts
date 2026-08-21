import { Injectable } from '@angular/core';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';

import { Router } from '@angular/router';

import { catchError } from 'rxjs/operators';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    const token = localStorage.getItem('token');

    console.log('========================');
    console.log('Request URL:', request.url);
    console.log('Token:', token);

    if (token) {

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Authorization Header Added');
    }
    else {
      console.log('No Token Found');
    }

    return next.handle(request).pipe(

      catchError((err: HttpErrorResponse) => {

        console.log('Interceptor Error:', err);

        return throwError(() => err);
      })
    );
  }
}