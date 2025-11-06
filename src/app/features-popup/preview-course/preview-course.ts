import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../services/safeUrl';

@Component({
  selector: 'app-preview-course',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafeUrlPipe],
  templateUrl: './preview-course.html',
  styleUrl: './preview-course.css'
})
export class PreviewCourse {
  @Input() previewurl: string = '';
  @Output() close = new EventEmitter<void>();

  isPdf(): boolean {
    return this.previewurl.toLowerCase().endsWith('.pdf');
  }

  isHtmlOrWebsite(): boolean {
    return !this.isPdf();
  }

  onClose() {
    this.close.emit();
  }
  
}
