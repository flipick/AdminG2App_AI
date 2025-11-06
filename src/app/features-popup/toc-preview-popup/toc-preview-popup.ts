import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../services/safeUrl';
import { CouresTocService } from '../../services/course-toc.service';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig } from '../../model/popupconfig';

@Component({
  selector: 'app-toc-preview-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  templateUrl: './toc-preview-popup.html',
  styleUrls: ['./toc-preview-popup.css']
})
export class TocPreviewPopup implements OnInit {
  @Input() curriculumId: number = 0;
  @Output() close = new EventEmitter<void>();

  tocData: any = null;
  selectedLessonUrl: string | null = null;
  selectedLesson: any = null;
  activeTopicIndex: number | null = null;

  popupConfig: PopupConfig = new PopupConfig();

  constructor(private tocService: CouresTocService) {}

  ngOnInit(): void {
    this.popupConfig = {
      popupFunctionalityType: 'preview',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'TOC Preview',
      buttons: []
    };

    if (this.curriculumId > 0) {
      this.loadTOC(this.curriculumId);
    }
  }

  loadTOC(id: number): void {
    this.tocService.getTOCById(id).subscribe({
      next: (res) => {
        if (res.success && res.result?.topics?.length > 0) {
          this.tocData = res.result;

          // ✅ Select first topic and first lesson by default
          this.activeTopicIndex = 0;
          const firstTopic = this.tocData.topics[0];
          if (firstTopic?.topicDetails?.length > 0) {
            this.openLesson(firstTopic.topicDetails[0]);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load TOC', err);
      }
    });
  }

  toggleTopic(index: number): void {
    this.activeTopicIndex = this.activeTopicIndex === index ? null : index;

    if (this.activeTopicIndex !== null && this.tocData?.topics?.length > this.activeTopicIndex) {
      const topic = this.tocData.topics[this.activeTopicIndex];

      // ✅ Auto-select first lesson when topic changes
      if (topic?.topicDetails?.length > 0) {
        this.openLesson(topic.topicDetails[0]);
      } else {
        this.selectedLesson = null;
        this.selectedLessonUrl = null;
      }
    }
  }

  openLesson(lesson: any): void {
    this.selectedLesson = lesson;
    if (lesson.instructorFile?.fileUrl) {
      this.selectedLessonUrl = lesson.instructorFile.fileUrl;
    } else if (lesson.externalLink) {
      this.selectedLessonUrl = lesson.externalLink;
    } else {
      this.selectedLessonUrl = null;
    }
  }

  closePopup(): void {
    this.close.emit();
  }
}
