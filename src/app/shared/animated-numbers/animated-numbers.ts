import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-numbers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-numbers.html',
  styleUrl: './animated-numbers.css'
})
export class AnimatedNumbers implements OnChanges {
  @Input() number: number = 0;
  @Input() prefix: string = '';
  @Input() suffix: string = '';

  displayedNumber: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['number']) {
      this.animateNumber(this.number);
    }
  }

  animateNumber(targetNumber: number): void {
    let start = 0;
    const duration = 2000; // 2 second animation
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetNumber / steps;

    const interval = setInterval(() => {
      start += increment;
      if (start >= targetNumber) {
        start = targetNumber;
        clearInterval(interval);
      }
      this.displayedNumber = Math.floor(start);
    }, stepTime);
  }
}
