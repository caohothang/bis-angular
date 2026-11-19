import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { ContentComponent } from './content/content.component';
import { DrinkComponent } from './drink/drink.component';
import { CodeComponent } from './code/code.component';

import { AuthGuard } from './_helpers';
import { Role } from './_models';
import { LoginComponent } from './account/login.component';
import { ContactComponent } from './_components/contact/contact.component';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);
const menuModule = () => import('./menu/menu.module').then(x => x.MenuModule);

const routes: Routes = [
    { path: '', component: LoginComponent},
    { path: 'contact', component: ContactComponent},
    { path: 'account', loadChildren: accountModule },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    { path: 'menu', loadChildren: menuModule,  canActivate: [AuthGuard]},
    { path: 'page/:alias', component: ContentComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    { path: 'drink', component: DrinkComponent, canActivate: [AuthGuard]},
    { path: 'code', component: CodeComponent},
    { path: 'outside', component: CodeComponent},
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        onSameUrlNavigation: 'reload',
        enableTracing: false
      })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
