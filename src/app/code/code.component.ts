import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { FetchService } from '../_services/fetch.service';
import * as _ from 'lodash';
import * as moment from 'moment';

declare const $;

@Component({
    selector: 'app-code',
    templateUrl: './code.component.html',
    styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit, OnDestroy {
    code: any = '';
    code2: any = '';
    languageId: any = 2;
    items: any = [];
    isSaving: boolean;
    location: number = 1;
    isLockScreen: boolean;
    errorMessage: string = '';

    // Server time & Check-in schedule
    checkinConfig: any = null;
    serverTimeDisplay: string = '--:--:--';
    serverDateDisplay: string = '';
    serverTimeOffset: number = 0;
    currentSession: string = null;
    organizationId: number = 1;

    private clockInterval: any;
    private syncInterval: any;
    private focusInterval: any;

    constructor(
        private _fetchService: FetchService,
        private _notifierService: NotifierService,
        private router: Router
    ) { }

    ngOnInit() {
        this.languageId = this._fetchService.languageId;
        if (this.router.url.indexOf('outside') > -1) {
            this.location = 2;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.organizationId) {
                this.organizationId = user.organizationId;
            }
        } catch (e) {}

        this.loadCheckinConfig();

        // Live clock interval (updates every second)
        this.clockInterval = setInterval(() => {
            this.updateClock();
        }, 1000);

        // Re-sync with server every 60s
        this.syncInterval = setInterval(() => {
            this.loadCheckinConfig(false);
        }, 60000);

        // Autofocus barcode input
        this.focusInterval = setInterval(() => {
            if (!$('#barcode-input').is(':focus') && !$('#barcode-input2').is(':focus')) {
                $('#barcode-input').focus();
            }
        }, 1000);
    }

    ngOnDestroy() {
        if (this.clockInterval) clearInterval(this.clockInterval);
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (this.focusInterval) clearInterval(this.focusInterval);
    }

    loadCheckinConfig(initial: boolean = true) {
        this._fetchService.getCheckinConfig(this.organizationId).subscribe((res: any) => {
            this.checkinConfig = res;
            if (res && res.serverTimestamp) {
                this.serverTimeOffset = res.serverTimestamp - Date.now();
            }
            this.updateClock();
        }, err => {
            console.error('Error fetching checkin config:', err);
        });
    }

    updateClock() {
        const now = new Date(Date.now() + (this.serverTimeOffset || 0));
        this.serverTimeDisplay = moment(now).format('HH:mm:ss');
        this.serverDateDisplay = moment(now).format('dddd, DD/MM/YYYY');
        this.evaluateCurrentSession(now);
    }

    timeToMinutes(timeStr: string): number {
        if (!timeStr) return null;
        const parts = timeStr.trim().split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
    }

    evaluateCurrentSession(now: Date) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const morningFrom = this.timeToMinutes(this.checkinConfig?.morningFrom);
        const morningTo = this.timeToMinutes(this.checkinConfig?.morningTo);
        const lunchFrom = this.timeToMinutes(this.checkinConfig?.lunchFrom);
        const lunchTo = this.timeToMinutes(this.checkinConfig?.lunchTo);

        if (morningFrom !== null && morningTo !== null && currentMinutes >= morningFrom && currentMinutes <= morningTo) {
            this.currentSession = 'breakfast';
        } else if (lunchFrom !== null && lunchTo !== null && currentMinutes >= lunchFrom && currentMinutes <= lunchTo) {
            this.currentSession = 'lunch';
        } else {
            this.currentSession = null;
        }
    }

    onCheckCode() {
        const scanCode = (this.code || this.code2 || '').trim();
        if (!scanCode) {
            return;
        }
        this.isSaving = true;
        this.errorMessage = '';
        this._fetchService.checkCode({
            code: scanCode,
            organizationId: this.organizationId,
            location: this.location
        }).subscribe((data: any) => {
            this.code = '';
            this.code2 = '';
            this.errorMessage = '';
            this.items.unshift(data);
            this.renderBill(data);
            this._notifierService.notify('success', 'Code used successfully.');
            this.onAutoFocusScanCode();
            this.isSaving = false;
            if (data.used == 1) {
                window.print();
            }
        }, err => {
            this.code = '';
            this.code2 = '';
            this.onAutoFocusScanCode();
            this.isSaving = false;
            let errMsg = 'Check-in failed';
            if (err.error) {
                if (Array.isArray(err.error) && err.error.length > 0) {
                    errMsg = err.error[0];
                } else if (typeof err.error === 'string') {
                    errMsg = err.error;
                } else if (err.error.message) {
                    errMsg = err.error.message;
                }
            } else if (err.message) {
                errMsg = err.message;
            }
            this.errorMessage = errMsg;
            this._notifierService.notify('error', errMsg);
            setTimeout(() => {
                this.errorMessage = '';
            }, 6000);
        });
    }

    onAutoFocusScanCode() {
        setTimeout(() => {
            const input = document.getElementById('barcode-input');
            if (input) input.focus();
        }, 100);
    }

    renderBill(data) {
        var html = '<p class="text-center">THE CATERERS</p><p class="line-print">------------------------------------------</p>';
        html += '<p class="time">' + data.time + '</p>';
        if (data.user) {
            html += '<p>' + data.user.displayName + ', ' + data.user.className + ' </p>';
        } else {
            html += '<p>' + data.displayName + ', ' + data.className + ' </p>';
        }
        if (data.user && data.user.diung) {
            html += '<p>Dị ứng: ' + data.user.diung + '</p>';
        }
        if (data.item) {
            html += "<div class='inline-item'>Item: " + data.item + '</div>';
        } else {
            html += '<p class="bold font-20">' + data.food + '</p>';
        }

        $(".print").html(html);
        html += '<p>Phiếu sử dụng lần ' + data.used + '</p>';
        if ($('.ticket').length > 10) {
            $('.ticket').eq($('.ticket').length - 1).remove();
        }

        $('.ticket-appent').prepend('<div class="ticket" >' + html + '</div>');
    }
}
