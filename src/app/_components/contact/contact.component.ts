import { Component, OnInit } from '@angular/core';
import { FetchService } from '@app/_services/fetch.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  item: any = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  isSubmit: boolean = false;
  submitted: boolean = false;
  languageId: number = 2;

  // Inline Notification state
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fetchService: FetchService,
    private alertService: NotifierService
  ) { }

  ngOnInit(): void {
    this.languageId = this.fetchService.languageId || 2;
  }

  clearAlert(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  onSubmit(): void {
    this.submitted = true;
    this.clearAlert();

    const name = (this.item.name || '').trim();
    const email = (this.item.email || '').trim();
    const phone = (this.item.phone || '').trim();
    const message = (this.item.message || '').trim();

    if (!name || !email || !phone || !message) {
      this.errorMessage = this.languageId === 1
        ? 'Vui lòng điền đầy đủ tất cả các trường thông tin bên dưới.'
        : 'Please fill in all required fields before submitting.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = this.languageId === 1
        ? 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.'
        : 'Please provide a valid email address.';
      return;
    }

    this.isSubmit = true;
    const payload = {
      name,
      email,
      phone,
      message,
      languageId: this.languageId
    };

    this.fetchService.sendContact(payload).subscribe({
      next: (res: any) => {
        this.isSubmit = false;
        this.submitted = false;
        this.errorMessage = null;
        this.successMessage = this.languageId === 1
          ? 'Gửi thông tin liên hệ thành công! Cảm ơn bạn, chúng tôi sẽ phản hồi trong thời gian sớm nhất.'
          : 'Your message has been sent successfully! Thank you for contacting us, we will respond shortly.';

        this.alertService.notify('success', this.successMessage);
        this.item = { name: '', email: '', phone: '', message: '' };
      },
      error: (err: any) => {
        this.isSubmit = false;
        this.successMessage = null;
        let msg = this.languageId === 1
          ? 'Không thể gửi tin nhắn lúc này. Vui lòng thử lại hoặc liên hệ qua số hotline.'
          : 'Failed to send your message. Please try again later or call our hotline.';

        if (typeof err === 'string') {
          msg = err;
        } else if (err?.error?.error) {
          msg = err.error.error;
        } else if (err?.error?.message) {
          msg = err.error.message;
        } else if (err?.message) {
          msg = err.message;
        }

        this.errorMessage = msg;
        this.alertService.notify('error', this.errorMessage);
      }
    });
  }
}
