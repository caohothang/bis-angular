import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/api/auth`;

@Injectable({ providedIn: 'root' })
export class AccountService {

    constructor(
        private router: Router,
        private http: HttpClient,
        private _notifierService: NotifierService
    ) {
        this.accountSubject = new BehaviorSubject<Account>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    public set setAccountValue(val: Account) {
        this.accountSubject.next(val);
    }
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;

    // helper methods

    private refreshTokenTimeout;

    login(code: string, password: string) {
        return this.http.post<any>(`${baseUrl}/login`, { code, password }, { withCredentials: true })
            .pipe(map(account => {
                localStorage.setItem('token', account.token);
                localStorage.setItem('user', JSON.stringify(account.user));
                this.accountSubject.next(account);
                // this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // const token = localStorage.getItem('refreshToken');
        // this.http.post<any>(`${baseUrl}/revoke-token`, { refreshToken: token }, { withCredentials: true }).subscribe();
        // this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this._notifierService.notify('success', 'Logout successfully');
        this.router.navigate(['/']);
    }

    refreshToken(token) {
        return this.http.post<any>(`${baseUrl}/refresh-token`, { refreshToken: token }, { withCredentials: true })
            .pipe(
                map((account) => {
                    this.accountSubject.next(account);
                    this.startRefreshTokenTimer();
                    return account;
                }),
                // catchError(this.handleError)
            );
    }

    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(code: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { code });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }

    create(params) {
        return this.http.post(baseUrl, params);
    }

    update(params) {
        return this.http.put(`${baseUrl}/update-user`, params)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue.user.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue.user, ...account };
                    const token = localStorage.getItem('token');
                    this.accountSubject.next({token, user: account});
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                // auto logout if the logged in account was deleted
                if (id === this.accountValue.user.id) {
                    this.logout();
                }
            }));
    }

    private startRefreshTokenTimer() {
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.token.split('.')[1]));

        // set a timeout to refresh the token a minute before it expires
        // const expires = new Date(jwtToken.exp * 1000);
        // const timeout = expires.getTime() - Date.now() - (60 * 1000);
        // localStorage.setItem('refreshToken', this.accountValue.refreshToken);
        // this.refreshTokenTimeout = setTimeout(() => this.refreshToken(this.accountValue.refreshToken).subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

    protected handleError(error: any): Promise<any> {
        let err = error.message || error;
        if (error.error) {
            err = error.error.message;
        }
        console.log(err);
        return Promise.reject(err);
    }
}
