import { Component, OnInit } from '@angular/core';
import {AccountService} from '@app/_services';
import {Account} from '@app/_models';
import { FetchService } from '@app/_services/fetch.service';

@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss']
})
export class HeadersComponent implements OnInit {
  accountValue: any = {};
  languageId: number = 2;
  constructor(private accountService: AccountService,   private fetchService: FetchService,) {
    this.accountService.account.subscribe(x => this.accountValue = x);
  }

  ngOnInit(): void {
    
  }

  logout(): void {
    this.accountValue = {};
    this.languageId = this.fetchService.languageId;
    this.accountService.logout();
  }

  isAllowed(): boolean {
    const allowed = ['16', '11', '24'];
    const groupIdString = this.accountValue.user?.groupId;
    if (!groupIdString) {
      return false;
    }
    const userGroups = groupIdString.split(',');
    const hasAccess = allowed.some(id => userGroups.includes(id));
    return hasAccess;
  }

}
