import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AccountService } from '@app/_services';

const baseUrl = `${environment.apiUrl}/api`;

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  public config: BehaviorSubject<any>;
  public languageId = 2;
  constructor(private http: HttpClient, private accountService: AccountService,) {
    this.config = new BehaviorSubject<any>(null);

    let user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.languageId = user.languageId;
    }
    //console.log(this.languageId)
  }

  getOrganizations() {
    return this.http.get(baseUrl + '/get-organizations');
  }

  getConfig() {
    return this.http.get(baseUrl + '/get-config').pipe(map(item => {
      this.config.next(item);
      return item;
    }));
  }

  getProfile(id) {
    return this.http.get(baseUrl + '/profile/' + id);
  }


  getBanner() {
    return this.http.get(baseUrl + '/getbanner');
  }

  getMenu() {
    return this.http.get(baseUrl + '/get-menu');
  }

  getAllItem() {
    return this.http.get(baseUrl + '/get-all-item');
  }

  getPage(alias) {
    return this.http.get(baseUrl + '/page/' + alias);
  }

  getOrder(week, year) {
    return this.http.get(baseUrl + '/get-order/' + week + '/' + year);
  }

  sendContact(params) {
    return this.http.post(`${baseUrl}/contact`, params);
  }


  checkOrder(week, month, year, user) {
    return this.http.get(`${baseUrl}/check-order/${week}/${month}/${year}/${user.id}`);
  }
  checkCodeDrink(params) {
    return this.http.post(`${baseUrl}/check-code-drink`, params);
  }
  saveDrink(params) {
    return this.http.post(`${baseUrl}/save-order`, params);
  }

  saveOrder(params) {
    return this.http.post(`${baseUrl}/save-order`, params);
  }

  getHistory() {
    return this.http.get(baseUrl + '/get-history');
  }

  getHistoryPayment() {
    return this.http.get(baseUrl + '/get-history-payment');
  }

  getUserInfo(params) {
    return this.http.post(baseUrl + '/check-topup', params);
  }

  updateTopup(params) {
    return this.http.post(baseUrl + '/update-topup', params);
  }

  getCheckinConfig(id: any = 1) {
    return this.http.get(`${baseUrl}/get-checkin-config/${id}`);
  }

  checkCode(params) {
    return this.http.post(baseUrl + '/check-code', params);
  }
}
