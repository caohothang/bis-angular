import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';


import { AccountService } from '../_services/account.service';
import { NotifierService } from 'angular-notifier';
@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    type: string = 'password';
    @Output() logged = new EventEmitter();
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: NotifierService
    ) { }

    ngOnInit() {
        let user = this.accountService?.accountValue?.user;
        if (user) {
            const allowed = ['16', '11', '24'];
            const groupIdString = user.groupId;
            if (!groupIdString) {
                this.router.navigate(['/profile/lich-su-dat-mon']);
                return;
            }
            const userGroups = groupIdString.split(',');
            const hasAccess = allowed.some(id => userGroups.includes(id));
            if (hasAccess) {
                this.router.navigate(['/drink']);
            } else {
                this.router.navigate(['/profile/lich-su-dat-mon']);
            }
        }
        this.form = this.formBuilder.group({
            code: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.login(this.f.code.value, this.f.password.value)
            .pipe(first())
            .subscribe({
                next: () => {    
                    // get return url from query parameters or default to home page
                    const returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
                    const user = this.accountService.accountValue;
                    //console.log(user)
                    this.logged.emit(true);
                    const allowed = ['16', '11', '24'];
                    const groupIdString = user.user.groupId;
                    if (!groupIdString) {
                        this.router.navigate(['/profile/lich-su-dat-mon']);
                        return;
                    }
                    const userGroups = groupIdString.split(',');
                    const hasAccess = allowed.some(id => userGroups.includes(id));
                    // this.router.navigateByUrl(returnUrl);
                     if (hasAccess) {
                        this.router.navigate(['/drink']);
                    } else {
                        this.router.navigate(['/profile/lich-su-dat-mon']);
                        //this.router.navigate([returnUrl]);
                    }

                    // .then(() => {
                    //     window.location.reload();
                    // });
                },
                error: error => {
                    // this.alertService.notify('error', error);
                    this.loading = false;
                }
            });
    }

    
}
