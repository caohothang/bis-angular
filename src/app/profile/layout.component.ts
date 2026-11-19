import { Component } from '@angular/core';
import {AccountService} from '../_services';
import {Account} from '../_models';
import {Router} from '@angular/router';
import { FetchService } from '@app/_services/fetch.service';

@Component({
    templateUrl: 'layout.component.html',
    styles: [
        'mat-sidenav {width: 304px;min-width: 304px;}' +
        'mat-list-item.active {background: #2f9e38 !important; color: white;}' +
        '.mat-drawer-container {min-height: 500px;}'
    ]
})
export class LayoutComponent {
    account: Account;
    url: string;
    languageId: number = 2;
    constructor(
        private accountService: AccountService,
        private router: Router,
        private fetchService: FetchService,
    ) {
        this.url = this.router.url;
        this.languageId = this.fetchService.languageId;
        this.accountService.account.subscribe(x => this.account = x);
    }
}
