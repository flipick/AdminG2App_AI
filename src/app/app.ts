import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Loader } from './shared/loader/loader';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ADMLearnLiteApp');
  showLayout = true;
}
