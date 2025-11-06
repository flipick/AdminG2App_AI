import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Loader } from '../../shared/loader/loader';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, Header, Sidebar,Loader],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {

}
