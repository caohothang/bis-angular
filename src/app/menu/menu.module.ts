import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu-routing.module';
import { MenuComponent } from './menu/menu.component';
import { PopupComponent } from '../popup/popup.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from "@angular/material/button";

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [MenuComponent, PopupComponent],
  imports: [
    CommonModule,
    MenuRoutingModule,
    MatGridListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],

})
export class MenuModule { }
