import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AccountService } from '@app/_services';
import { FetchService } from '@app/_services/fetch.service';
import * as moment from 'moment';
import { Account } from '@app/_models';
import { forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { NotifierService } from 'angular-notifier';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent } from '@app/popup/popup.component';
declare const $;

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    organizations:any = [];
    currOng: { [key: string]: any };
    startDate: any;
    endDate: any;
    isOrder: boolean;
    account: Account;
    weeks = [];
    checkOrder: any;
    order: { [key: string]: any };
    year: any;
    isEndDate: boolean;
    weekNumber: number = 0;
    hasNoMenuData: boolean = false;
    @ViewChild('confirmOrderDialog') confirmOrderDialog: TemplateRef<any>;
    orderCompleteDialogRef: any = null;
    weekList = [];
    languageId: number = 2;
    weekSelected: any;
    isDoneOrder = false;
    isSaving = false;
    config: any = {};
    user: any;
    month: any;
    isCompletedWeek = true;
    maxWeek: any;
    nextYear: boolean;
    weekIndex = 0;
    showInforImage: string = '';
    isLoading: boolean = true;
    days: any = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    itemDay: any = {
        breakfast_title_vn: 'Món sáng',
        breakfast_title_en: 'Breakfast',
        lunch_title_vn: 'Trưa',
        lunch_title_en: 'Lunch',
        snack_breakfast_title_vn: 'Phụ sáng',
        snack_breakfast_title_en: 'Morning Snack',
        snack_lunch_title_vn: 'Phụ chiều',
        snack_lunch_title_en: 'Afternoon Snack',
    };
    classLunchNotes: any = {
        'ES': 'Lunch set includes vegetables, a starch, soup, and dessert',
        'JS': 'Set lunch includes soup, salad, vegetables, a starch, dessert, and juice',
        'MS': 'Set lunch includes soup, salad, vegetables, a starch, dessert, and juice',
        'HS': 'Set lunch includes soup, salad, vegetables, a starch, dessert, and juice',
        'TF': 'Set lunch includes soup, salad, vegetables, a starch, dessert, and juice',
    };
    constructor(
        private fetchService: FetchService,
        private accountService: AccountService,
        private alertService: NotifierService,
        private router: Router,
        public dialog: MatDialog
    ) {
        this.isOrder = false;
        this.account = this.accountService.accountValue;
        this.user = this.account.user;
        this.languageId = this.fetchService.languageId;
        this.nextYear = false;
    }

    checkScroll() {
        if (window.pageYOffset > 500) {
            $('.your_order').addClass('stick-item');
        } else {
            $('.your_order').removeClass('stick-item');
        }
    }

    ngOnInit() {
        const self = this;
        this.fetchService.getOrganizations().subscribe((res: any) => {
            this.organizations = Array.isArray(res) ? res : [];
            this.config = this.organizations.find(item => {
                return this.user && item.id == this.user.organizationId;
            });
            if (!this.config || Object.keys(this.config).length === 0) {
                this.config = this.organizations[0] || {};
            }
            this.settingWeeks();
            if (this.languageId == 1) {
                this.showInforImage = 'Nhấn vào để xem hình';
            } else {
                this.showInforImage = 'Click to see';
            }
            // this.onGetProfile();
            setTimeout(() => {
                window.addEventListener('scroll', function(event) {
                    self.checkScroll();
                }, false);
                const height = $(window).height();
                $('.Order_number').css('max-height', height - 280 + 'px');
            }, 500);
        });
       
     
    }

    onGetProfile() {
        this.fetchService.getProfile(this.user.id).subscribe(res => {
            this.user = res;
            localStorage.setItem('user', JSON.stringify(this.user));
        });
    }

    checkAndGetOrder() {
        const monday = moment().startOf('month').add('1', 'months');
        if (monday.format('ddd') === 'Sun' || monday.format('ddd') === 'Sat') {
            monday.add('1', 'weeks');
        }
        let month = monday.format('M');
        let week = moment(monday).startOf('isoWeek').format('W');
        let year = moment(monday).startOf('isoWeek').format('YYYY');
        this.month = month;
        if (this.config?.startDateOrder) {
            week = moment(this.config.startDateOrder).startOf('isoWeek').format('W');
            month = moment(this.config.startDateOrder).format('M');
            if (this.config.endDateOrder) {
                year = moment(this.config.endDateOrder).format('YYYY');
            }
        }

        return [
            this.fetchService.checkOrder(week, month, year, this.user),
            this.fetchService.getOrder(week, year)
        ];
    }

    getMaxWeekOfYear(year) {
        return moment().isoWeekYear(Number(year)).isoWeeksInYear();
    }

    settingWeeks() {
        let self = this;
        forkJoin(this.checkAndGetOrder()).subscribe((result: [any, { [key: string]: any }]) => {
            this.isLoading = false;
            this.checkOrder = result[0];
            this.order = result[1];
            if (this.checkOrder && this.checkOrder.items) {
                let weekItems = _.chain(this.checkOrder.items).groupBy('week').sortBy('weekNumber').value();
                _.each(weekItems, function(days, index) {
                    let itemSelected = [];
                    _.each(days, function(day) {
                        const code = moment(day.date).format('dddd').toLowerCase();
                        day = {...day, ...self.itemDay};
                        day.code = code;
                        let dayName = moment(day.date).format('ddd');
                        let dayIndex:any = _.findIndex(self.days, function(day) {
                            return day == dayName;
                        });
                        let dayNumber = parseInt(dayIndex) + 2;
                        day.title_vn = 'Thứ ' + dayNumber + ', ngày ' + moment(day.date).format('DD/MM/YYYY');
                        day.title_en = moment(day.date).format('dddd') + ', ' + moment(day.date).format('MM/DD/YYYY');
                       
                        day.breakfast = self.order.items[day.breakfastId];
                        day.lunch = self.order.items[day.lunchId];
                        day.snack_breakfast = self.order.items[day.breakfast_snackId];
                        day.lunch_snack = self.order.items[day.lunch_snackId];
                        day.lunch_notes = self.getLunchNotes(self.order?.menu?.classType);
                        itemSelected.push(day);
                    })
        
                    self.weekList[index] = { weekNumber: days[0].week, monthNumber: days[0].month, yearNumber: days[0].year, title_vn: 'Tuần ' + days[0].week + ' (' + moment(days[0].date).startOf("isoWeek").format('DD/MM') + ' - ' + moment(days[0].date).endOf("isoWeek").format("DD/MM") + ')', title_en: 'Week ' + days[0].week + ' (' + moment(days[0].date).startOf("isoWeek").format('MM/DD') + ' - ' + moment(days[0].date).endOf("isoWeek").format("MM/DD") + ')', itemSelected: itemSelected };
                });
                console.log(this.weekList)
            }

            const compareDate = moment().format('DD');
            this.startDate = this.config.from;
            if ((+this.startDate <= +compareDate && +compareDate <= +this.config.to) || this.user.role == 4) {
                this.isOrder = true;
            }
            this.currOng = this.organizations.find((item: any) => {
                return item.id === this.account.user.organizationId;
            });
            if (this.config && this.config.endDateOrder) {
                this.endDate = this.config.endDateOrder;
                this.year = moment(this.endDate).format('YYYY');
            } else {
                const endDateMoment = moment().add('1', 'months').endOf('month');
                this.endDate = endDateMoment.format('YYYY-MM-DD');
                this.year = endDateMoment.format('YYYY');
            }

            if (moment(this.endDate).format('ddd') === 'Sat') {
                this.endDate = moment(this.endDate).subtract(1, 'days').format('YYYY-MM-DD');
            } else if (moment(this.endDate).format('ddd') === 'Sun') {
                this.endDate = moment(this.endDate).subtract(2, 'days').format('YYYY-MM-DD');
            }
        
            this.filterWeekListByConfig();
            if (!this.weekSelected && this.weekList.length > 0) {
                this.weekSelected = this.weekList[0];
                this.weekNumber = this.weekSelected.weekNumber;
            }
            if (this.order && this.order.menu) {
                this.hasNoMenuData = false;
                this.getWeek();
            } else {
                if (!this.weekNumber) {
                    if (this.config?.startDateOrder) {
                        this.weekNumber = Number(moment(this.config.startDateOrder).startOf('isoWeek').format('W'));
                    } else {
                        this.weekNumber = Number(moment().startOf('isoWeek').format('W'));
                    }
                }
                this.handleNoMenuForWeek(this.weekNumber);
            }
            const activeYear = Number(this.year || moment().year());
            this.maxWeek = this.getMaxWeekOfYear(activeYear);
        });
    }

    getItem(items = null, day) {
        if (!items) {
            return [];
        }
        items = items?.split(',');
        const list:any = [];
        const checkDate = day.format('YYYY-MM-DD');
        items.forEach((itemId) => {
            if (this.order.items[itemId]) {
                // if (this.weekSelected && this.weekSelected.itemSelected.length > 0) {
                //     let selected = _.find(this.weekSelected.itemSelected, function(day) {
                //         return checkDate == day.date && (itemId == day.breakfastId || itemId == day.breakfast_snackId || itemId == day.lunchId || itemId == day.lunch_snackId)
                //     });
                //     this.order.items[itemId].selected = selected;
                //}
                if (this.checkOrder?.items?.length > 0) {
                    let selected = this.checkOrder.items.find(item => { 
                        return (item.breakfastId == itemId || item.breakfast_snackId == itemId || item.lunchId == itemId || item.lunch_snackId == itemId) && checkDate == item.date;
                    });
                    this.order.items[itemId].selected = selected;
                }
              
                list.push({...this.order.items[itemId]});
            }
        });
        return list;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getLunchNotes(classType?: string): string[] {
        if (this.order?.menu?.lunch_notes && Array.isArray(this.order.menu.lunch_notes) && this.order.menu.lunch_notes.length > 0) {
            return this.order.menu.lunch_notes;
        }
        const typesStr = classType || this.order?.menu?.classType || '';
        if (!typesStr) {
            return [];
        }
        const types = typesStr.split(',').map((t: string) => t.trim());
        const notes: string[] = [];
        types.forEach((t: string) => {
            if (this.classLunchNotes[t]) {
                notes.push(this.classLunchNotes[t]);
            }
        });
        return _.uniq(notes);
    }

    getMondayOfWeek(year, weekNumber) {
        return moment().isoWeekYear(Number(year)).isoWeek(Number(weekNumber)).startOf('isoWeek');
    }

    getWeek(gweek = null) {
        this.weekList = _.sortBy(this.weekList, 'weekNumber');
        if (this.weekList[this.weekIndex]) {
            this.weekList[this.weekIndex].itemSelected = this.weekList[this.weekIndex].itemSelected || [];  
        }
        const days = this.days;
        let firstDayOfMonth = moment();

        if (gweek) {
            firstDayOfMonth = this.getMondayOfWeek(Number(this.year), this.weekNumber); 
        } else {
            const nextMonth = moment().add(1, 'months').startOf('months');
            const firstDay = nextMonth.startOf('day');
            const fortmatDay = firstDay.format('ddd');
            if (days.includes(fortmatDay)) {
                firstDayOfMonth = firstDay;
                if (fortmatDay == 'Sun' || fortmatDay == 'Sat') {
                    firstDayOfMonth = nextMonth.isoWeekday() > 1 ? nextMonth.isoWeekday(8) : nextMonth.isoWeekday(1);
                }
            }
            if (this.config.startDateOrder) {
                firstDayOfMonth = moment(this.config.startDateOrder);
            }
        }
        const cloneDays = _.clone(days);
        const indexDay = _.findIndex(cloneDays, day => {
            return day == firstDayOfMonth.format('ddd');
        });
        if (indexDay) {
            cloneDays.splice(0, indexDay);
        }
        if (this.order.menu) {
            this.year = this.order.menu.year;
            this.weeks = [];
            cloneDays.forEach((day, dayNumber) => {
                const nextDay = moment(firstDayOfMonth).add(dayNumber, 'days');
                const code = nextDay.format('dddd').toLowerCase();
                let existDay = this.weeks.find(week => { return week.date == nextDay.format('YYYY-MM-DD')});
                if (!existDay) {
                    this.weeks.push({
                        date: nextDay.format('YYYY-MM-DD'),
                        code,
                        title_vn: this.capitalizeFirstLetter(nextDay.locale('vi').format('dddd, [Ngày] DD/MM/YYYY')),
                        title_en: nextDay.locale('en').format('dddd, MM/DD/YYYY'),
                        breakfast_items: this.getItem(this.order.menu[code + '_breakfast'], nextDay),
                        snack_breakfast_items: this.getItem(this.order.menu[code + '_snack_breakfast'], nextDay),
                        lunch_items: this.getItem(this.order.menu[code + '_lunch'], nextDay),
                        lunch_snack_items: this.getItem(this.order.menu[code + '_snack_lunch'], nextDay),
                        lunch_notes: this.getLunchNotes(this.order.menu.classType),
                        ...this.itemDay
                    });
                }
            
            });
            if (this.weeks.length > 0) {
                const endDateMonth = this.weeks.find(week => {
                    return week.date === this.endDate;
                });
                if (endDateMonth) {
                    this.isEndDate = true;
                    this.checkDoneOrder();
                } else {
                    this.isEndDate = false;
                }
                this.weekNumber = Number(gweek || this.order.menu.week);
                const existWeek = this.weekList.find((weekItem) => {
                    return weekItem.weekNumber == this.weekNumber && Number(weekItem.yearNumber || this.year) === Number(this.year);
                });
              
                if (!existWeek) {
                    this.weekList.push({
                        weekNumber: Number(this.weekNumber),
                        monthNumber: Number(firstDayOfMonth.format('M')),
                        yearNumber: Number(this.year || firstDayOfMonth.format('YYYY')),
                        title_vn: 'Tuần ' + this.weekNumber + ' (' + firstDayOfMonth.startOf('isoWeek').format('DD/MM') + ' - ' + firstDayOfMonth.endOf('isoWeek').format('DD/MM') + ')',
                        title_en: 'Week ' + this.weekNumber + ' (' + firstDayOfMonth.startOf('isoWeek').format('MM/DD') + ' - ' + firstDayOfMonth.endOf('isoWeek').format('MM/DD') + ')',
                        items: this.weeks || [],
                        itemSelected: []
                    });
                }
                this.filterWeekListByConfig();
                this.weekSelected = this.weekList[this.weekIndex] || this.weekList[0];
            }
           
        } else {
            this.handleNoMenuForWeek(this.weekNumber);
        }
    }

    changeWeek(week, index) {
        this.weekNumber = Number(week.weekNumber);
        if (week.yearNumber) {
            this.year = Number(week.yearNumber);
        }
        this.filterWeekListByConfig();
        if (this.weekList[index]) {
            this.weekSelected = this.weekList[index];
            this.weekSelected.itemSelected = this.weekList[index].itemSelected || [];  
        }

        this.getCurrentWeek(index);
    }

    compareDate(day) {
        return moment(day.date).isBefore(this.endDate) || moment(day.date).isSame(this.endDate);
    }

    nextWeek() {
        if (this.isSaving || this.isNextWeekDisabled()) {
            return false;
        }
        const currYear = Number(this.year || moment().year());
        const currWeek = Number(this.weekNumber || (this.weekSelected ? this.weekSelected.weekNumber : 0));
        const maxWeeksInCurrYear = this.getMaxWeekOfYear(currYear);

        let nextWeekNum: number;
        let nextYearNum: number;

        if (currWeek >= maxWeeksInCurrYear) {
            nextWeekNum = 1;
            nextYearNum = currYear + 1;
        } else {
            nextWeekNum = currWeek + 1;
            nextYearNum = currYear;
        }

        const maxConfig = this.getMaxConfigWeek();
        if (maxConfig) {
            if (nextYearNum > maxConfig.year || (nextYearNum === maxConfig.year && nextWeekNum > maxConfig.week)) {
                if (this.languageId === 1) {
                    this.alertService.notify('info', 'Bạn đã đến tuần cuối cùng của kỳ đặt món.');
                } else {
                    this.alertService.notify('info', 'You have reached the final week of the order period.');
                }
                return false;
            }
        }
        this.scrollToItem();
        if (!this.isCompletedWeek) {
            return false;
        }
        if (!this.isEndDate) {
            if (this.languageId === 1) {
                this.alertService.notify('warning', 'VUI LÒNG CHỌN TUẦN KẾ TIẾP');
            } else {
                this.alertService.notify('warning', 'PLEASE PRE-ORDER FOR NEXT WEEK');
            }
        }
        setTimeout(() => {
            if ($('.main_Ourmenu').length > 0) {
                $('html, body').animate({ scrollTop: $('.main_Ourmenu').offset().top }, 1000);
            }
        }, 500);

        this.isSaving = true;
        this.weekNumber = nextWeekNum;
        this.year = nextYearNum;
        if (nextYearNum > currYear) {
            this.month = 1;
            this.nextYear = true;
        }
        this.maxWeek = this.getMaxWeekOfYear(this.year);
        this.weekIndex++;
        this.weeks = [];
        this.fetchService.getOrder(this.weekNumber, this.year).subscribe((res: any) => {
            this.isSaving = false;
            this.order.menu = res ? res.menu : null;
            if (res && res.menu) {
                this.hasNoMenuData = false;
                this.getWeek(this.weekNumber);
                this.filterWeekListByConfig();
                this.weekSelected = _.find(this.weekList, (week) => {
                    return week.weekNumber == this.weekNumber && Number(week.yearNumber || this.year) === Number(this.year);
                });
            } else {
                this.handleNoMenuForWeek(this.weekNumber);
            }
        }, err => {
            this.isSaving = false;
            this.handleNoMenuForWeek(this.weekNumber);
        });
    }

    handleNoMenuForWeek(weekNum: number) {
        const currYear = Number(this.year || moment().year());
        const maxConfig = this.getMaxConfigWeek();
        if (maxConfig) {
            if (currYear > maxConfig.year || (currYear === maxConfig.year && Number(weekNum) > maxConfig.week)) {
                if (this.languageId === 1) {
                    this.alertService.notify('info', 'Không có tuần vượt quá cấu hình ngày kết thúc.');
                } else {
                    this.alertService.notify('info', 'Cannot navigate beyond the configured end date.');
                }
                this.filterWeekListByConfig();
                if (this.weekList.length > 0) {
                    this.weekSelected = this.weekList[this.weekList.length - 1];
                    this.weekNumber = Number(this.weekSelected.weekNumber);
                    this.year = Number(this.weekSelected.yearNumber || currYear);
                }
                return;
            }
        }
        this.hasNoMenuData = true;
        this.weeks = [];
        this.isEndDate = false;
        const monday = this.getMondayOfWeek(currYear, weekNum);
        const sunday = moment(monday).endOf('isoWeek');
        const weekTitleVn = 'Tuần ' + weekNum + ' (' + monday.format('DD/MM') + ' - ' + sunday.format('DD/MM') + ')';
        const weekTitleEn = 'Week ' + weekNum + ' (' + monday.format('MM/DD') + ' - ' + sunday.format('MM/DD') + ')';

        let existWeek = this.weekList.find((w: any) => w.weekNumber == weekNum && Number(w.yearNumber || currYear) === currYear);
        if (!existWeek) {
            existWeek = {
                weekNumber: Number(weekNum),
                monthNumber: Number(monday.format('M')),
                yearNumber: currYear,
                title_vn: weekTitleVn,
                title_en: weekTitleEn,
                items: [],
                itemSelected: []
            };
            this.weekList.push(existWeek);
            this.filterWeekListByConfig();
        }
        this.weekSelected = existWeek;

        const message = `Week ${weekNum} has no menu data available. Please contact the canteen.`;
        this.alertService.notify('warning', message);
    }

    checkDoneOrder() {
        setTimeout(() => {
            if ((this.isEndDate || this.isNextWeekDisabled()) && this.checkCompleteWeek()) {
                this.isDoneOrder = true;
            }
        }, 300);
    }

    getCurrentWeek(index = 0) {
        this.isSaving = true;
        const self = this;
        this.fetchService.getOrder(this.weekNumber, this.year).subscribe((res: any) => {
            this.isSaving = false;
            this.order.menu = res ? res.menu : null;
            if (res && res.menu) {
                this.hasNoMenuData = false;
                this.getWeek(this.weekNumber);
                this.filterWeekListByConfig();
                this.weekSelected = _.find(this.weekList, (week) => {
                    return week.weekNumber == this.weekNumber;
                });
            } else {
                this.handleNoMenuForWeek(this.weekNumber);
            }
        }, err => {
            this.isSaving = false;
            this.handleNoMenuForWeek(this.weekNumber);
        });
    }

    scrollToItem() {
        const self = this;
        const itemPerDays = $('.item-per-day');
        if (itemPerDays.length === 0) {
            self.isCompletedWeek = true;
            return;
        }
        itemPerDays.each(function(index) {
            if (!$(this).find('.card_btn').hasClass('active')) {
                $('html, body').animate({ scrollTop: $('.item-per-day').eq(index).offset().top - 50 }, 1000);
                if (this.languageId === 1) {
                    self.alertService.notify('error', 'Bạn cần chọn món trước khi sang tuần khác');
                } else {
                    self.alertService.notify('error', 'Please select food before go to next week');
                }

                self.isCompletedWeek = false;
                return false;
            } else {
                self.isCompletedWeek = true;
            }
        });
    }

    showOrderCompleteModal() {
        this.isDoneOrder = true;
        this.alertService.notify('success', 'Your pre-order has been completed successfully!');
        if (!this.orderCompleteDialogRef && this.confirmOrderDialog) {
            this.orderCompleteDialogRef = this.dialog.open(this.confirmOrderDialog, {
                width: '460px',
                disableClose: false,
                panelClass: 'custom-order-complete-dialog'
            });
            this.orderCompleteDialogRef.afterClosed().subscribe(() => {
                this.orderCompleteDialogRef = null;
            });
        }
    }

    closeOrderCompleteModal() {
        if (this.orderCompleteDialogRef) {
            this.orderCompleteDialogRef.close();
            this.orderCompleteDialogRef = null;
        }
    }

    confirmGoHistory() {
        this.closeOrderCompleteModal();
        this.router.navigate(['/profile/lich-su-dat-mon']);
    }

    goDashboard() {
        this.router.navigate(['/profile/lich-su-dat-mon']);
    }

    showImage(item) {
        const dialogRef = this.dialog.open(PopupComponent, {
            data: item
        });
        
        dialogRef.afterClosed().subscribe(result => {
            
        });
    }

    selectSnack(item, items, day, type) {
        const exist = _.find(this.weekSelected.itemSelected, (i) => {
            return i.code === day.code && day.date === i.date;
        });
        if (!exist) {
            if (this.languageId === 1) {
                this.alertService.notify('error', 'Bạn cần chọn món chính trước khi chọn món phụ');
            } else {
                this.alertService.notify('error', 'Please select main menu frist.');
            }

            return;
        }
        _.each(items, (sitem) => {
            sitem.selected = false;
        });
        item.selected = true;
        if (type == 'snack_breakfast') {
            day.snack_breakfast = item;
            day.snack_breakfast_items = items;
        } else {
            day.lunch_snack = item;
            day.lunch_snack_items = items;
        }
        this.weekSelected.itemSelected = _.sortBy(this.weekSelected.itemSelected, 'date');
        _.each(this.weekSelected.itemSelected, (mitem, index) => {
            if (mitem.code === day.code) {
                this.weekSelected.itemSelected[index] = day;
            }
        });
        this.weekSelected.user = this.user;
        this.weekSelected.items = this.weeks;
        this.isSaving = true;
        this.fetchService.saveOrder(this.weekSelected).subscribe((res) => {
            this.isSaving = false;
            let successText = '';
            if (this.languageId === 1) {
                successText = 'MENU THÁNG ĐÃ CHỌN XONG';
            } else {
                successText = 'Pre-Order Completed';
            }
            if ((this.isEndDate || this.isNextWeekDisabled()) && this.checkCompleteWeek()) {
                this.showOrderCompleteModal();
            } else {
                if (this.languageId === 1) {
                    this.alertService.notify('success', 'Món bạn chọn đã lưu vào hệ thống');
                } else {
                    this.alertService.notify('success', 'Your select saved into system');
                }
            }
        });
    }

    selectItem(item, items: [any], day, type) {
        items.forEach(it => {
            it.selected = false;
        });
        item.selected = true;
        const exists = this.weekSelected.itemSelected.find(itemSelect => {
            return itemSelect.code === day.code && day.date === itemSelect.date;
        });
        day[type] = item;
        if (type === 'breakfast' && day.snack_breakfast_items.length == 1) {
            day.snack_breakfast = day.snack_breakfast_items[0];
            day.snack_breakfast_items[0].selected = true;
        }

        if (type === 'lunch' && day.lunch_snack_items.length == 1) {
            day.lunch_snack = day.lunch_snack_items[0];
            day.lunch_snack_items[0].selected = true;
        }


        if (!exists) {
            this.weekSelected.itemSelected.push(day);
        } else {
            exists.lunch = day.lunch;
            exists.breakfast = day.breakfast;
            exists.snack_breakfast = day.snack_breakfast;
            exists.lunch_snack = day.lunch_snack;
        }
        this.weekSelected.itemSelected = _.sortBy(this.weekSelected.itemSelected, 'date');
        const existsWeek: any = this.weekList.find((weekItem: any) => {
            return weekItem.weekNumber == this.weekNumber;
        });

        if (existsWeek) {
            existsWeek.itemSelected = this.weekSelected.itemSelected;
        }
        this.weekSelected.items = this.weeks;
        this.isSaving = true;
        this.weekSelected.user = this.user;
        this.fetchService.saveOrder(this.weekSelected).subscribe(res => {
            this.isSaving = false;
            let successText = '';
            if (this.languageId === 1) {
                successText = 'MENU THÁNG ĐÃ CHỌN XONG';
            } else {
                successText = 'Pre-Order Completed';
            }
            if ((this.isEndDate || this.isNextWeekDisabled()) && this.checkCompleteWeek()) {
                this.showOrderCompleteModal();
            } else {
                if (this.languageId === 1) {
                    this.alertService.notify('success', 'Món bạn chọn đã lưu vào hệ thống');
                } else {
                    this.alertService.notify('success', 'Your select saved into system');
                }
            }
        }, err => {
            this.isSaving = false;
            this.alertService.notify('error', 'Có lỗi xảy ra khi lưu món');
        });
    }

    checkItem(day, select = 'breakfast') {
        if (select === 'breakfast') {
            return _.find(day.breakfast_items, (item) => {
                return item.selected;
            });
        } else {
            return _.find(day.lunch_items, function(item) {
                return item.selected;
            });
        }
    }

    checkCompleteWeek() {
        const itemPerDays = $('.item-per-day');
        if (itemPerDays.length === 0) {
            return false;
        }
        let completed = true;
        itemPerDays.each(function() {
            if (!$(this).find('.card_btn').hasClass('active')) {
                completed = false;
            }
        });
        return completed;
    }

    getMaxConfigWeek(): { week: number, year: number } | null {
        if (this.config && this.config.endDateOrder) {
            const m = moment(this.config.endDateOrder);
            return {
                week: Number(m.isoWeek()),
                year: Number(m.isoWeekYear())
            };
        }
        if (this.endDate) {
            const m = moment(this.endDate);
            return {
                week: Number(m.isoWeek()),
                year: Number(m.isoWeekYear())
            };
        }
        return null;
    }

    filterWeekListByConfig() {
        const maxConfig = this.getMaxConfigWeek();
        if (maxConfig) {
            this.weekList = this.weekList.filter((w: any) => {
                const wYear = Number(w.yearNumber || this.year);
                const wWeek = Number(w.weekNumber);
                if (wYear > maxConfig.year) return false;
                if (wYear === maxConfig.year && wWeek > maxConfig.week) return false;
                return true;
            });
            if (this.weekSelected) {
                const selYear = Number(this.weekSelected.yearNumber || this.year);
                const selWeek = Number(this.weekSelected.weekNumber);
                if (selYear > maxConfig.year || (selYear === maxConfig.year && selWeek > maxConfig.week)) {
                    this.weekSelected = this.weekList[this.weekList.length - 1];
                    if (this.weekSelected) {
                        this.weekNumber = Number(this.weekSelected.weekNumber);
                        this.year = Number(this.weekSelected.yearNumber || this.year);
                    }
                }
            }
        }
        // Chronological sort across years: first by yearNumber, then by weekNumber
        this.weekList = _.sortBy(this.weekList, [
            (w: any) => Number(w.yearNumber || this.year),
            (w: any) => Number(w.weekNumber)
        ]);
    }

    isNextWeekDisabled(): boolean {
        if (this.isEndDate) {
            return true;
        }
        const maxConfig = this.getMaxConfigWeek();
        if (maxConfig) {
            const currYear = Number(this.year || moment().year());
            const currWeek = Number(this.weekNumber || (this.weekSelected ? this.weekSelected.weekNumber : 0));
            if (currYear > maxConfig.year) {
                return true;
            }
            if (currYear === maxConfig.year && currWeek >= maxConfig.week) {
                return true;
            }
        }
        return false;
    }

    completeLastWeekOrder() {
        if (this.isSaving) return;
        this.scrollToItem();
        if (!this.isCompletedWeek) {
            return;
        }
        if (this.weekSelected) {
            this.weekSelected.items = this.weeks;
            this.weekSelected.user = this.user;
            this.isSaving = true;
            this.fetchService.saveOrder(this.weekSelected).subscribe(res => {
                this.isSaving = false;
                this.showOrderCompleteModal();
            }, err => {
                this.isSaving = false;
                this.showOrderCompleteModal();
            });
        } else {
            this.showOrderCompleteModal();
        }
    }
}
