import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeScript, SafeStyle, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], term, attribute): any {
    return term
      ? items.filter(item => item[attribute].indexOf(term) !== -1)
      : items;
  }
}
@Pipe({
  name: 'safeUrl',
  pure: false
})
export class SafeUrlPipe implements PipeTransform {
  constructor(public sanitizer: DomSanitizer) { }
  transform(value: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'base64':
        return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${value}`);
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        return value;
        //throw new Error(`Invalid safe type specified: ${type}`);
    }
  }
}
@Pipe({
  name: 'convertDuration',
  pure: false
})
export class ConvertDurationPipe implements PipeTransform {
  transform(item, needPad = false): any {
    return this.msToTime(item);
  }

  msToTime(s, needPad = false) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;
    if (!needPad) {
      let durations = [hrs, mins, secs, ms];
      return durations.join(":")
    } else {
      let durations = [this.pad(hrs), this.pad(mins), this.pad(secs), this.pad(ms, 3)];
      return durations.join(":");
    }
  }

  pad(n, z = 2) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }
}

@Pipe({
  name: 'filterWebmodel',
  pure: false
})
export class FilterWebModelPipe implements PipeTransform {
  transform(items: any[], options): any {
    let optionSelected = [...options].filter(option => {
      return option.selected;
    });
    if (optionSelected.length > 0) {
      items = items.filter(item => {
        let option = optionSelected.find(op => {
          return op.control == item.control
        });
        if (option) {
          return item;
        }
      });
      return items;
    } else {
      return items;
    }
  }
}

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {
  transform(items: any[], sortedBy: string, type: string = ''): any {
    if (type == 'asc') {
      return items.sort((a, b) => { return a[sortedBy] - b[sortedBy] });
    } else {
      return items.sort((a, b) => { return b[sortedBy] - a[sortedBy] });
    }

  }
}



@Pipe({
  name: 'lastName'
})
export class LastNamePipe implements PipeTransform {
  transform(item) {
   let items = item.split(" ");
   if (items.length > 0) {
     return items[items.length - 1];
   } else {
     return item;
   }

  }
}