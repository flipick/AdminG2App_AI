import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader-service';

@Component({
  standalone: true,
  selector: 'app-loader',
  imports: [CommonModule,AsyncPipe],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class Loader {
 isLoading: boolean = false;
   constructor(public loaderService: LoaderService) {}
}
