import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AccountService } from '@app/_services';
import { FetchService } from '@app/_services/fetch.service';
import { NotifierService } from 'angular-notifier';
import { finalize, first } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  languageId: number = 1;

  // Visibility toggle flags for password fields
  showOldPass: boolean = false;
  showNewPass: boolean = false;
  showConfirmPass: boolean = false;

  // Inline alert notification state
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private fetchService: FetchService,
    private notifierService: NotifierService
  ) { }

  ngOnInit(): void {
    this.languageId = this.fetchService.languageId || 1;
    this.initForm();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      passwords: this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(3)]],
        confirmPass: ['', [Validators.required]],
      }, { validators: [this.checkPasswords] }),
    });

    // Clear alert when user starts typing again
    this.form.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = null;
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  get p() {
    return (this.form.get('passwords') as FormGroup).controls;
  }

  checkPasswords = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPass')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  toggleOldPass(): void {
    this.showOldPass = !this.showOldPass;
  }

  toggleNewPass(): void {
    this.showNewPass = !this.showNewPass;
  }

  toggleConfirmPass(): void {
    this.showConfirmPass = !this.showConfirmPass;
  }

  clearAlert(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.clearAlert();

    if (this.form.invalid) {
      Object.keys(this.f).forEach(field => {
        const control = this.form.get(field);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(f => {
            const pControl = control.get(f);
            pControl.markAsTouched({ onlySelf: true });
            pControl.markAsDirty({ onlySelf: true });
          });
        } else {
          control.markAsTouched({ onlySelf: true });
          control.markAsDirty({ onlySelf: true });
        }
      });

      this.errorMessage = this.languageId === 1
        ? 'Vui lòng điền đầy đủ và chính xác các thông tin bên dưới.'
        : 'Please fill in all required fields accurately.';
      return;
    }

    this.loading = true;
    const params: { [key: string]: any } = {
      password: this.f.oldPassword.value,
      oldPassword: this.f.oldPassword.value,
      newPassword: this.p.password.value,
      newPasswordConfirm: this.p.confirmPass.value,
      languageId: this.languageId
    };

    this.accountService.update(params)
      .pipe(
        first(),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (item) => {
          this.submitted = false;
          this.errorMessage = null;
          this.successMessage = this.languageId === 1
            ? 'Đổi mật khẩu thành công! Mật khẩu mới của bạn đã được cập nhật.'
            : 'Password changed successfully! Your new password has been updated.';

          this.notifierService.notify('success', this.successMessage);

          // Reset form fields
          this.form.reset();
          // Reset toggle eyes
          this.showOldPass = false;
          this.showNewPass = false;
          this.showConfirmPass = false;
        },
        error: (error) => {
          this.successMessage = null;
          let msg = this.languageId === 1
            ? 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.'
            : 'Failed to change password. Please check your current password.';

          if (typeof error === 'string') {
            msg = error;
          } else if (error?.error) {
            msg = typeof error.error === 'string' ? error.error : (error.error.message || error.error.error || msg);
          } else if (error?.message) {
            msg = error.message;
          }

          this.errorMessage = msg;
        }
      });
  }
}
