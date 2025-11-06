import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.loadingSubject.next(true);
    //console.log('Loader show'); // debug
  }

  hide() {
    this.loadingSubject.next(false);
    //console.log('Loader hide'); // debug
  }
}
