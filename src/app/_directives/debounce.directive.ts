
import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

@Directive({
  selector: '[debounce]'
})
export class DebounceDirective implements OnInit, OnDestroy {
  @Input() delay = 500;
  @Input() name = null;
  @Input() ngModel;
  @Output() func = new EventEmitter();
  @Output() isSaving = new EventEmitter();
  private keyup = new Subject();
  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
    this.subscription = this.keyup.pipe(
      tap(keyup => {
        this.isSaving.emit(keyup);
      }),
      debounceTime(this.delay)
    ).subscribe((e: any) => {
      this.func.emit(e)
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('keyup', ['$event'])
  clickEvent(event) {
    if (event.code == 'Tab') return;
    event.preventDefault();
    event.stopPropagation();
    this.keyup.next(event);
  }
}