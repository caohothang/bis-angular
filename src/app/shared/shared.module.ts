import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MyCustomMaterialModule } from './customMaterial.module';



@NgModule({
    imports: [
        CommonModule,
        MyCustomMaterialModule,
    ],
    exports: [
        MyCustomMaterialModule,
    ],
    declarations: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
