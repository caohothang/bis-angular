import { Component } from '@angular/core';

import { AccountService } from './_services';
import { Account, Role } from './_models';
import {FetchService} from '@app/_services/fetch.service';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    Role = Role;
    account: Account;
    constructor(private accountService: AccountService, private fetchService: FetchService) {
        this.accountService.account.subscribe(x => {
            this.account = x;
            this.fetchService.languageId = this.account?.user?.languageId || 2;
        });
        this.fetchService.getConfig().subscribe(res => {

        });
    }

    logout(): void {
        this.accountService.logout();
    }
}
