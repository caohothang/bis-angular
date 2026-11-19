import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';

import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService, private alertService: NotifierService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            const error = (err && err.error && err.error.message) || err.statusText;
            if ([401].includes(err.status) && this.accountService.accountValue) {
                // auto logout if 401 or 400 response returned from api
                this.alertService.notify('error', `Your token expired, please login.`);
                this.accountService.logout();
            }
            else if (err.status === 403) {
                this.alertService.notify('error', `Bad Request.`);
            }
            else if (err.status === 401) {
                this.alertService.notify('error', `You don't have permission.`);
            } else {
                if (err.error?.message) {
                    this.alertService.notify('error', error);
                }else {
                    if (typeof err.error === 'object') {
                        for (const i of Object.keys(err.error)) {
                            this.alertService.notify('error', err.error[i]);
                        }
                    }else {
                        this.alertService.notify('error', error);
                    }
                }
            }
            // console.log(err);
            return throwError(error);
        }));
    }
}
