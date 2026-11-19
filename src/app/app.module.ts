import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
// import { fakeBackendProvider } from './_helpers';

import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from './_helpers';
import { AccountService } from './_services';
import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { HomeComponent } from './home';
import { ContentComponent } from './content/content.component';
import { DrinkComponent } from './drink/drink.component';
import { CodeComponent } from './code/code.component';
import { ContactComponent } from './_components/contact/contact.component';

import { FilterPipe, SafeUrlPipe, ConvertDurationPipe, SortByPipe, FilterWebModelPipe, LastNamePipe } from './_pipes/filter.pipe';
import { DebounceDirective } from './_directives/debounce.directive';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { NotifierModule } from 'angular-notifier';
import { HeadersComponent } from './_components/headers/headers.component';
import { FooterComponent } from './_components/footer/footer.component';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        SharedModule,
        DragDropModule,
        NotifierModule.withConfig({
            position: {
                horizontal: {
                    position: 'right',
                    distance: 12,
                },
                vertical: {
                    position: 'top',
                    distance: 12,
                    gap: 10,
                },
            },
            theme: 'material',
            behaviour: {
                autoHide: 3000,
                onClick: false,
                onMouseover: 'pauseAutoHide',
                showDismissButton: true,
                stacking: 4,
            },
            animations: {
                enabled: true,
                show: {
                    preset: 'slide',
                    speed: 300,
                    easing: 'ease',
                },
                hide: {
                    preset: 'fade',
                    speed: 300,
                    easing: 'ease',
                    offset: 50,
                },
                shift: {
                    speed: 300,
                    easing: 'ease',
                },
                overlap: 150,
            },
        }),
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        ContactComponent,
        ContentComponent,
        DrinkComponent,
        CodeComponent,
        FilterPipe,
        SafeUrlPipe,
        ConvertDurationPipe,
        SortByPipe,
        LastNamePipe,
        FilterWebModelPipe,
        DebounceDirective,
        HeadersComponent,
        FooterComponent
    ],
    exports: [
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        FilterPipe,
        SafeUrlPipe,
        ConvertDurationPipe,
        SortByPipe,
        LastNamePipe,
        FilterWebModelPipe,
        DebounceDirective,
    ],
    entryComponents: [
        // PopupComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

        // provider used to create fake backend
        // fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
