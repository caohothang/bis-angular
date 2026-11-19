import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { MustMatch } from '@app/_helpers';
import { NotifierService } from 'angular-notifier';

@Component({ templateUrl: 'update.component.html' })
export class UpdateComponent implements OnInit {
    account = this.accountService.accountValue;
    form: FormGroup;
    loading = false;
    submitted = false;
    deleting = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: NotifierService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: [/*this.account.title*/'', Validators.required],
            firstName: [/*this.account.firstName*/'', Validators.required],
            lastName: [/*this.account.lastName*/'', Validators.required],
            email: [/*this.account.email*/'', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword')
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
        this.accountService.update(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.notify('success', 'Update successful');
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    // this.alertService.notify('error', error);
                    this.loading = false;
                }
            });
    }

    onDelete() {
        if (confirm('Are you sure you want to delete?')) {
            this.deleting = true;
            this.accountService.delete(this.account.user.id)
                .pipe(first())
                .subscribe(() => {
                    this.alertService.notify('success', 'Account deleted successfully');
                });
        }
    }
}
