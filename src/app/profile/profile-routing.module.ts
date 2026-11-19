import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { DetailsComponent } from './details.component';
import { UpdateComponent } from './update.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {HistoryOrderComponent} from './history-order/history-order.component';
import {HistoryPaymentComponent} from './history-payment/history-payment.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: DetailsComponent },
            { path: 'update', component: UpdateComponent },
            { path: 'change-password', component: ChangePasswordComponent },
            { path: 'lich-su-dat-mon', component: HistoryOrderComponent },
            { path: 'lich-su-giao-dich', component: HistoryPaymentComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProfileRoutingModule { }
