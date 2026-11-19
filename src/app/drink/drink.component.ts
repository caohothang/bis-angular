import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { FetchService } from '../_services/fetch.service';
import * as _ from 'lodash';
import { AccountService } from '@app/_services';
import * as moment from 'moment';
declare const $;
@Component({
    selector: 'app-drink',
    templateUrl: './drink.component.html',
    styleUrls: ['./drink.component.scss']
})
export class DrinkComponent implements OnInit {

    items: any = [];
    itemSelected: any = {};
    drinks: any = [];
    languageId: number = 2;
    total: number = 0;
    code: any = '';
    maBill: any = '';
    loaiThanhToan: number = 0;
    codeTopup: any = '';
    user: any = {};
    userTopup: any = {};
    accountValue: any = {};
    isSaving: boolean;
    isLockScreen: boolean;
    isOrderCanteen: boolean;
    constructor(private _fetchService: FetchService, private accountService: AccountService,private router: Router, private route: ActivatedRoute, private _notifierService: NotifierService) { }

    ngOnInit() {
        let user = JSON.parse(localStorage.getItem('user'));
        // if (user && user.groupId != 16 && user.groupId != 11 && user.groupId != 24) {
        //     this.router.navigate(['/']);
        // }
        if (user.groupId == 24){
            this.isOrderCanteen = true;
        }
        this.accountService.account.subscribe(x => this.accountValue = x);
        this.onGetMenu();
    }

    onGetMenu() {
        this._fetchService.getMenu().subscribe(res => {
            this.items = res;
            this.itemSelected = res[0];
        });
    }

    onAddItem(item) {
        let checkDrink = this.drinks.find(drink => {
            return drink.id == item.id
        });
        if (checkDrink) {
            checkDrink.quantity++;
        } else {
            item.quantity = 1;
            this.drinks.push(item);
        }

        this.onCheckTotal();

    }

    onFormatNumber(item) {
        let data = item.money.replace(/,/g, '', true);
        let parts = data.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        item.money = parts.join(".");
    }

    onGetInfoUser() {
        this.isSaving = true;
        this._fetchService.getUserInfo({ code: this.code }).subscribe(res => {
            this.user = res;
            this.isSaving = false;
        }, err => {
            this.isSaving = false;
        })
    }

    onGetInforUserTopup() {
        this.isSaving = true;
        this._fetchService.getUserInfo({ code: this.codeTopup }).subscribe(res => {
            this.userTopup = res;
            this.isSaving = false;
        }, err => {
            this.isSaving = false;
        })
    }

    onUpdateTopup() {
        this.isSaving = true;
        let self = this;
        this._fetchService.updateTopup({ code: this.codeTopup, money: this.userTopup.money, createdById: this.accountValue?.user.id, displayName: this.userTopup.displayName,
            userId: this.userTopup.id, createdByDisplayName: this.accountValue?.user.displayName }).subscribe((res: any) => {
            this.isSaving = false;
            let message = 'Bạn đã nạp tiền thành công';
            // if (this.languageId == 2) {
            //     message = 'You recharged topup successfully';
            // }
     
            this._notifierService.notify('success', message);
            
            let html = `<div class="text-center"><img height="60" src="/assets/images/logo.png"></div><p class="text-center bold block">RECEIPT (Cash in)</p>`;
           
            html += '<div class="pull-left"><b>Date </b>' + moment().format('DD/MM/YYYY') + '</div><div class="pull-right"> <b>@ </b>' + moment().format('hh:mm:ss') + '</div><div class="clear"></div>';
       
            html += '<div style="margin: 10px 0px"><b style="height:40px;display:block" class="font-14"><span class="pull-left">Topup: </span> <span class="pull-right">' + self.onConvertPrice(this.userTopup.money) + ' đ</span></b><hr><p class="block text-center"><i class="font-12 bold">Thank You !</i></p><hr></div>';
          
            html += '<p class="text-center"><span class="">Card ID: (' + res.card_code + ') </span> <span class=""> - ' + res.displayName + '</span><div class="clear"></div></p>';
            // html += '<p><span class="pull-left">First Balance</span> <span class="pull-right">' + self.onConvertPrice(res.oldTopup) + ' đ</span><div class="clear"></div></p>';
            html += '<p class="text-center"><span >Current Balance: </span> <span class="">' + self.onConvertPrice(res.topup) + '</span><div class="clear"></div></p>';
            
          
          
            $(".print").html(html);
            setTimeout(() => {
                window.print();
                this.codeTopup = '';
                this.userTopup = res;
                this.userTopup.money = '';
            }, 100);
        }, err => {
            this.isSaving = false;
        })
    }

    onCheckTotal() {
        this.total = 0;
        this.drinks.forEach(item => {
            this.total += item.price * item.quantity;
        });
    }

    onDelete(index) {
        this.drinks.splice(index, true);
        this.onCheckTotal();
    }

    onEdit(item) {
        item.isEdit = true;
        this.onCheckTotal();
    }

    onUpdate(item) {
        item.isEdit = false;
        this.onCheckTotal();
    }

    onSave() {
        if (this.drinks.length == 0) {
            this.code = '';
            this._notifierService.notify('error', 'Bạn chưa chọn món');
            $('#barcode-input').focus();
            return;
        }
        let self = this;
        this.isSaving = true;
        let params = { code: this.code, total: this.total, data: this.drinks, organizationId: 1, maBill:this.maBill, loaiThanhToan:this.loaiThanhToan};
        this._fetchService.checkCodeDrink(params).subscribe((res: any) => {
            this.isSaving = false;
            if (res) {
                this.code = '';
                if (res) {
                    let loaiThanhToan = '';
                    if (this.loaiThanhToan == 1) {
                        loaiThanhToan = ' (Cash out)';
                    }
                    let html = `<div class="text-center"><img height="60" src="/assets/images/logo.png"></div><p class="text-center bold block">RECEIPT ${loaiThanhToan}</p>`;
                   
                    html += '<div class="pull-left"><b>Date </b>' + res.date + '</div><div class="pull-right"> <b>@ </b>' + res.time + '</div><div class="clear"></div><hr>';
                    html += '<table><tr><td class="text-left">Item</td><td class="text-center">Qty</td><td class="text-right">Price</td><td class="text-right">Discount</td><td class="text-right">Amount</td></tr>';
                    _.each(this.drinks, function (item, index) {
                        const discount = res.discount || 0;
                        const price = item.price * item.quantity;
                        const amount = price - (price * discount / 100);
                        html += '<tr>';
                        // html += '<td class="text-center">' + parseInt(index + 1) + '</td>';
                        html += '<td class="text-left">' + item.title_vn + '</td>';
                        html += '<td class="text-center">' + item.quantity + '</td>';
                        html += '<td class="text-right">' + self.onConvertPrice(item.price) + '</td>';
                        html += '<td class="text-right">' + self.onConvertPrice(discount) + '</td>';
                        html += '<td class="text-right">' + self.onConvertPrice(amount) + ' đ</td>';
                        html += '</tr>';
                    });

                    html += "</table>";
                    html += '<hr><b class="font-14">Total: <span class="pull-right">' + self.onConvertPrice(res.total) + ' đ</span></b><hr><p class="block text-center"><i class="font-12 bold">Thank You !</i></p>';
                    if (res.code !== 'TOPUP') {
                        html += '<p class="text-center"><span class="">Card ID: (' + res.card_code + ') </span> <span class=""> - ' + res.displayName + '</span><div class="clear"></div></p>';
                        // html += '<p><span class="pull-left">First Balance</span> <span class="pull-right">' + self.onConvertPrice(res.oldTopup) + ' đ</span><div class="clear"></div></p>';
                        html += '<p class="text-center"><span >Current Balance: </span> <span class="">' + self.onConvertPrice(res.topup) + ' đ</span><div class="clear"></div></p>';
                    }
                    if (res.maBill) {
                        html += `<p class="text-center"><span >Mã bill: </span> <span class="">${res.maBill}</span><div class="clear"></div></p>`;
                    }
                  
                    $(".print").html(html);
                    // html+= '<p>Phiếu sử dụng lần ' + res.used +'</p>';
                    // $('.ticket-appent').prepend('<div class="ticket" >' + html + '</div>');
                    // $scope.codes.push($scope.code);

                    this.drinks = [];
                    this.code = '';
                    this.total = 0;
                    this.maBill = '';
                    this.loaiThanhToan = 0;
                    if (!this.isOrderCanteen) {
                        setTimeout(() => {
                            window.print();
                        }, 100);
                        setTimeout(() => {
                            window.print();
                        }, 1000);
                    }
                
                    this._notifierService.notify('success', 'Thanh toán thành công')

                    $('#barcode-input').focus();
                }
            }
        }, err => {
            this.isSaving = false;
            this.isLockScreen = false;
        })
    }

    onConvertPrice(price) {
        if (!price) return 0;
        var parts = String(price).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };
}
