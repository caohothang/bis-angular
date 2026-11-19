import { Component, OnInit } from '@angular/core';
import { FetchService } from '@app/_services/fetch.service';
import { AccountService } from '@app/_services';
import { NotifierService } from 'angular-notifier';
import * as _ from 'lodash';
import * as moment from 'moment';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-history-order',
  templateUrl: './history-order.component.html',
  styleUrls: ['./history-order.component.scss']
})
export class HistoryOrderComponent implements OnInit {
  histories: any[] = [];
  languageId: number = 2;
  user: any;
  weekList: any[] = [];
  filteredWeekList: any[] = [];
  days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  todayStr: string = '';

  month: number = parseInt(moment().format('M'), 10);
  selectYear: number = parseInt(moment().format('YYYY'), 10);
  currentRealMonth: number = parseInt(moment().format('M'), 10);
  currentRealYear: number = parseInt(moment().format('YYYY'), 10);
  showAllMonths: boolean = false;
  isMonthPickerOpen: boolean = false;
  isLoading: boolean = true;

  monthsList: { id: number; name_en: string; name_vn: string; short_en: string }[] = [];
  availableMonthsSet: Set<string> = new Set();

  constructor(
    private fetchService: FetchService,
    private accountService: AccountService,
    private notifierService: NotifierService
  ) {
    this.languageId = this.fetchService.languageId;
    this.user = this.accountService.accountValue?.user || {};
    this.initMonthsList();
  }

  ngOnInit(): void {
    this.todayStr = moment().format('YYYY-MM-DD');
    this.month = parseInt(moment().format('M'), 10);
    this.selectYear = parseInt(moment().format('YYYY'), 10);
    this.loadHistory();
  }

  initMonthsList() {
    this.monthsList = [
      { id: 1, name_en: 'January', name_vn: 'Tháng 1', short_en: 'Jan' },
      { id: 2, name_en: 'February', name_vn: 'Tháng 2', short_en: 'Feb' },
      { id: 3, name_en: 'March', name_vn: 'Tháng 3', short_en: 'Mar' },
      { id: 4, name_en: 'April', name_vn: 'Tháng 4', short_en: 'Apr' },
      { id: 5, name_en: 'May', name_vn: 'Tháng 5', short_en: 'May' },
      { id: 6, name_en: 'June', name_vn: 'Tháng 6', short_en: 'Jun' },
      { id: 7, name_en: 'July', name_vn: 'Tháng 7', short_en: 'Jul' },
      { id: 8, name_en: 'August', name_vn: 'Tháng 8', short_en: 'Aug' },
      { id: 9, name_en: 'September', name_vn: 'Tháng 9', short_en: 'Sep' },
      { id: 10, name_en: 'October', name_vn: 'Tháng 10', short_en: 'Oct' },
      { id: 11, name_en: 'November', name_vn: 'Tháng 11', short_en: 'Nov' },
      { id: 12, name_en: 'December', name_vn: 'Tháng 12', short_en: 'Dec' },
    ];
  }

  loadHistory() {
    this.isLoading = true;
    this.fetchService.getHistory().subscribe((histories: any[]) => {
      this.isLoading = false;
      this.weekList = [];
      this.availableMonthsSet.clear();

      if (!histories || histories.length === 0) {
        this.filteredWeekList = [];
        return;
      }

      // Track months that have orders
      histories.forEach(item => {
        if (item.month && item.year) {
          this.availableMonthsSet.add(`${parseInt(item.month, 10)}_${parseInt(item.year, 10)}`);
        }
      });

      // Group by week
      this.histories = _.chain(histories)
        .groupBy('week')
        .map((weekGroup, weekKey) => {
          const sortedWeekGroup = _.sortBy(weekGroup, 'date');
          const weekNumber = parseInt(sortedWeekGroup[0].week || sortedWeekGroup[0].weekNumber || 0, 10);
          return {
            weekKey,
            weekNumber,
            data: sortedWeekGroup
          };
        })
        .sortBy('weekNumber')
        .value()
        .reverse()
        .map(item => item.data);

      this.histories.forEach((days: any[]) => {
        days.forEach(day => {
          const mDate = moment(day.date);
          const dayName = mDate.format('ddd');
          const dayIndex = _.findIndex(this.days, d => d === dayName);
          const dayNumber = dayIndex >= 0 ? dayIndex + 2 : '';
          day.title_vn = 'Thứ ' + dayNumber + ' (' + mDate.format('DD/MM/YYYY') + ')';
          day.title_en = mDate.format('dddd') + ' (' + mDate.format('MM/DD/YYYY') + ')';
          day.isToday = (day.date === this.todayStr);
        });

        const startMoment = moment(days[0].date).startOf('isoWeek');
        const endMoment = moment(days[0].date).endOf('isoWeek');
        const weekNum = days[0].week;

        this.weekList.push({
          weekNumber: weekNum,
          monthNumber: parseInt(days[0].month, 10),
          yearNumber: parseInt(days[0].year, 10),
          title_vn: 'Tuần ' + weekNum + ' (' + startMoment.format('DD/MM') + ' - ' + endMoment.format('DD/MM') + ')',
          title_en: 'Week ' + weekNum + ' (' + startMoment.format('MM/DD') + ' - ' + endMoment.format('MM/DD') + ')',
          dateRange: startMoment.format('MM/DD') + ' - ' + endMoment.format('MM/DD/' + startMoment.format('YYYY')),
          days: days
        });
      });

      // Default to current month always
      this.applyMonthFilter();
    }, err => {
      this.isLoading = false;
      console.error('Error fetching history:', err);
    });
  }

  applyMonthFilter() {
    if (this.showAllMonths) {
      this.filteredWeekList = [...this.weekList];
    } else {
      this.filteredWeekList = this.weekList.filter(week => {
        return (week.monthNumber === this.month && week.yearNumber === this.selectYear) ||
               week.days.some((d: any) => parseInt(d.month, 10) === this.month && parseInt(d.year, 10) === this.selectYear);
      });
    }
  }

  hasOrdersInMonth(m: number, y: number): boolean {
    return this.availableMonthsSet.has(`${m}_${y}`);
  }

  selectMonth(m: number) {
    this.month = m;
    this.showAllMonths = false;
    this.isMonthPickerOpen = false;
    this.applyMonthFilter();
  }

  goToCurrentMonth() {
    this.month = this.currentRealMonth;
    this.selectYear = this.currentRealYear;
    this.showAllMonths = false;
    this.isMonthPickerOpen = false;
    this.applyMonthFilter();
  }

  changeYear(delta: number) {
    this.selectYear += delta;
    this.applyMonthFilter();
  }

  prevMonth() {
    if (this.month === 1) {
      this.month = 12;
      this.selectYear--;
    } else {
      this.month--;
    }
    this.showAllMonths = false;
    this.applyMonthFilter();
  }

  nextMonth() {
    if (this.month === 12) {
      this.month = 1;
      this.selectYear++;
    } else {
      this.month++;
    }
    this.showAllMonths = false;
    this.applyMonthFilter();
  }

  toggleMonthPicker() {
    this.isMonthPickerOpen = !this.isMonthPickerOpen;
  }

  toggleShowAll() {
    this.showAllMonths = !this.showAllMonths;
    this.isMonthPickerOpen = false;
    this.applyMonthFilter();
  }

  getCurrentMonthName(): string {
    const found = this.monthsList.find(m => m.id === this.month);
    if (!found) return `Month ${this.month}`;
    return this.languageId === 1 ? found.name_vn : found.name_en;
  }

  getTotalMealsInView(): number {
    let count = 0;
    this.filteredWeekList.forEach(w => {
      w.days.forEach(d => {
        if (d.breakfast) count++;
        if (d.breakfast_snack) count++;
        if (d.lunch) count++;
        if (d.lunch_snack) count++;
      });
    });
    return count;
  }

  export() {
    if (!this.user || !this.user.id) {
      this.notifierService.notify('error', 'User information not found.');
      return;
    }

    if (this.filteredWeekList.length === 0) {
      const msg = this.languageId === 1
        ? `Không tìm thấy đơn đặt món trong ${this.getCurrentMonthName()} ${this.selectYear} để xuất Excel.`
        : `No orders found in ${this.getCurrentMonthName()} ${this.selectYear} to export.`;
      this.notifierService.notify('warning', msg);
      return;
    }

    const exportBaseUrl = environment.url || 'http://bis.test';
    const exportUrl = `${exportBaseUrl}/site/index?export=true&userId=${this.user.id}&month=${this.month}&year=${this.selectYear}&lang=${this.languageId}`;
    window.open(exportUrl, '_blank');
  }
}
