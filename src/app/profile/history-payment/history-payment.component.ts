import { Component, OnInit } from '@angular/core';
import { FetchService } from '@app/_services/fetch.service';
import { AccountService } from '@app/_services';
import * as moment from 'moment';

@Component({
  selector: 'app-history-payment',
  templateUrl: './history-payment.component.html',
  styleUrls: ['./history-payment.component.scss']
})
export class HistoryPaymentComponent implements OnInit {
  histories: any = null;
  languageId: number = 2;
  activeTab: 'orders' | 'payments' = 'orders';
  searchTerm: string = '';
  isLoading: boolean = true;

  constructor(
    private fetchService: FetchService,
    private accountService: AccountService
  ) {
    this.languageId = this.fetchService.languageId;
  }

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.isLoading = true;
    this.fetchService.getHistoryPayment().subscribe(
      (res: any) => {
        this.isLoading = false;
        this.histories = res || { orders: [], payments: [], user: {} };
      },
      err => {
        this.isLoading = false;
        console.error('Error fetching payment history:', err);
      }
    );
  }

  setActiveTab(tab: 'orders' | 'payments'): void {
    this.activeTab = tab;
    this.searchTerm = '';
  }

  formatPrice(price: any): string {
    if (price === null || price === undefined || price === '') { return '0'; }
    const num = Math.round(Number(price) || 0);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(date: any): string {
    if (!date) return '—';
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  formatDateOnly(date: any): string {
    if (!date) return '—';
    return moment(date).format('DD/MM/YYYY');
  }

  formatTimeOnly(date: any): string {
    if (!date) return '';
    return moment(date).format('HH:mm');
  }

  getTotalSpent(): number {
    if (!this.histories || !this.histories.orders) return 0;
    return this.histories.orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
  }

  getTotalTopup(): number {
    if (!this.histories || !this.histories.payments) return 0;
    return this.histories.payments.reduce((sum: number, p: any) => sum + (Number(p.topup) || 0), 0);
  }

  getFilteredOrders(): any[] {
    if (!this.histories || !this.histories.orders) return [];
    if (!this.searchTerm.trim()) return this.histories.orders;
    const term = this.searchTerm.toLowerCase().trim();
    return this.histories.orders.filter((o: any) =>
      (o.title && o.title.toLowerCase().includes(term)) ||
      (o.maBill && o.maBill.toLowerCase().includes(term))
    );
  }

  getFilteredPayments(): any[] {
    if (!this.histories || !this.histories.payments) return [];
    if (!this.searchTerm.trim()) return this.histories.payments;
    const term = this.searchTerm.toLowerCase().trim();
    return this.histories.payments.filter((p: any) =>
      (p.message && p.message.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.apptransid && p.apptransid.toLowerCase().includes(term))
    );
  }
}
