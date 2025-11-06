import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Popup } from './popup/popup';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    Popup
  ],
  exports: [Popup]
})
export class SharedModule { }
