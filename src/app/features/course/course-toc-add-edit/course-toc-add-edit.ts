import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Topic, TopicDetail } from '../../../model/course-toc';
import { Utils } from '../../../utilities/utils';
import { CouresTocService } from '../../../services/course-toc.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getUserId } from '../../../services/utility';
import { ICourse } from '../../../model/course';
import { TocPreviewPopup } from '../../../features-popup/toc-preview-popup/toc-preview-popup';
import { PopupConfig } from '../../../model/popupconfig';
import { Popup } from '../../../shared/popup/popup';

@Component({
  selector: 'app-course-toc-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, Popup, TocPreviewPopup],
  templateUrl: './course-toc-add-edit.html',
  styleUrl: './course-toc-add-edit.css'
})
export class CourseTocAddEdit implements OnInit {
  @Input() courseId: number = 0;
  @Input() course: ICourse | null = null;
  @Input() curriculumId: number = 0;
  @Output() RedirectToSetting = new EventEmitter<void>();
  popupConfig: PopupConfig = new PopupConfig();
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  selectedDetail: TopicDetail | null = null;

  editingTopic: Topic | null = null;
  editingDetail: TopicDetail | null = null;

  contentTypes: any[] = [];
  durations: string[] = [];

  fileError = ''; urlError = ''; durationError = ''; customDuration = ''; topicTitleError = '';
  lessonTitleError = ''; successMessage = ''; errorMessage = '';
  

  constructor(private courseTOCService: CouresTocService) { }

  ngOnInit() {
    this.contentTypes = Utils.getContentData();
    this.durations = Utils.getDuration();
    this.fetchTopics();
     this.popupConfig.isShowPopup = false;
  }

  fetchTopics() {
    this.courseTOCService.getTOC(this.curriculumId).subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          if (res.result.topics.length > 0) {
            this.topics = res.result.topics.map((t: any) => ({
              topicId: t.topicId,
              topicTitle: t.topicTitle,
              description: t.description,
              saved: true,
              curriculumSectionId: this.curriculumId,
              topicDetails: t.topicDetails.map((d: any) => ({
                topicDetailsId: d.topicDetailsId,
                topicDetailsTitle: d.topicDetailsTitle,
                description: d.description,
                saved: true,
                duration: d.instructorFile?.duration || '',
                durationtype: d.instructorFile?.durationType || 'None',
                contentType: d.instructorFile?.fileType || 'html',
                url: d.instructorFile?.fileType == 'externallink' ? d.instructorFile?.fileUrl : '',
                fileId: d.instructorFile?.fileId,
                fileName: d.instructorFile?.fileName,
              }))
            }));
            this.selectTopic(this.topics[0])
          }
        }
      }
    });
  }

  // --- Add Topic ---
  addTopic() {
    this.clearMessage();
    const last = this.topics[this.topics.length - 1];
    if (last && !last.saved) return;

    const newTopic: Topic = {
      topicId: 0,
      topicTitle: `Module ${this.topics.length + 1}`,
      description: '',
      saved: false,
      topicDetails: [],
      curriculumSectionId: this.curriculumId
    };

    this.topics.push(newTopic);
    this.selectedTopic = newTopic;
    this.selectedDetail = null;
  }

  saveTopic(topic: Topic) {
    if (!this.editingTopic) return;
    // push editing values into selectedTopic
    Object.assign(topic, this.editingTopic);

    this.clearMessage();
    if (topic.topicTitle == '') {
      this.topicTitleError = 'Please provide a title.';
      return;
    }
    this.courseTOCService.addUpdateTopic(topic).subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          topic.topicId = res.result;
          topic.saved = true;
          this.successMessage = 'Module added/updated sucessflly';
        }
        else {
          this.errorMessage = res.message;
        }
      },
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = error.message || 'Unknown error occurred';
      }
    });
  }

  // --- Add Lesson (TopicDetail) ---
  addDetail() {
    this.clearMessage();
    if (!this.selectedTopic || !this.selectedTopic.saved) return;

    const last = this.selectedTopic.topicDetails[this.selectedTopic.topicDetails.length - 1];
    if (last && !last.saved) return;

    const newDetail: TopicDetail = {
      topicDetailsId: 0,
      topicDetailsTitle: `Lesson ${this.selectedTopic.topicDetails.length + 1}`,
      description: '',
      saved: false,
      duration: 'None',
      contentType: 'html',
      url: '',
      topicid: '',
      fileId: 0,
      fileName: '',
      durationtype: 'None'
    };

    this.selectedTopic.topicDetails.push(newDetail);
    this.selectedDetail = newDetail;
  }

  saveDetail(detail: TopicDetail) {
    this.clearMessage();
    if (detail.topicDetailsTitle == '') {
      this.lessonTitleError = 'Please provide a title.';
      return;
    }
    if (detail.contentType === 'externallink' &&
      (!detail.url || !detail.url.startsWith('http'))) {
      this.urlError = 'Please provide a valid external link (http/https).';
      return;
    }

    if (detail.contentType !== 'externallink' && !detail.file && detail.fileId == 0) {
      this.fileError = 'Please upload a valid file before saving.';
      return;
    }

    if (detail.durationtype === 'Custom' && this.durationError) return;
    const finalDuration = detail.durationtype === 'Custom' ? Utils.convertDurationToText(this.customDuration) : (detail.duration || '');
    const tenantIds = this.course?.courseTenants.map(t => t.tenantId).join(',') || "";
    const formData = new FormData();
    formData.append("TopicId", this.selectedTopic!.topicId.toString());
    formData.append("TenantId", tenantIds);
    formData.append("InstructorId", getUserId());
    formData.append("CourseId", this.courseId.toString());
    formData.append("Title", detail.topicDetailsTitle || "");
    formData.append("Description", detail.description || "");
    formData.append("ContentType", detail.contentType || "");
    if (detail.file) {
      formData.append("ImportFile", detail.file);
    }
    formData.append("Duration", finalDuration);
    formData.append("DurationType", detail.durationtype);
    formData.append("UploadUrl", detail.url || "");
    formData.append("TopicDetailsId", detail.topicDetailsId.toString());
    formData.append("FileId", detail.fileId.toString());
    formData.append("FileName", detail.fileName.toString());

    this.courseTOCService.addUpdateTOC(formData).subscribe({
      next: (res: any) => {
        detail.topicDetailsId = res.result.topicDetailsId;
        detail.saved = true;
        detail.fileId = res.result.fileId;
        detail.fileName = res.result.fileName;
        this.successMessage = 'Lesson added/updated sucessfully.';
      },
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = error.message || 'Unknown error occurred';
      }
    });
  }

  selectTopic(topic: Topic) {
    this.selectedTopic = topic;
    this.selectedDetail = null;
    this.successMessage = '';
  }

  selectDetail(detail: TopicDetail, topic: Topic) {
    this.selectedTopic = topic;
    this.selectedDetail = detail;
    this.customDuration = this.selectedDetail.durationtype == "Custom" ? this.selectedDetail.duration : '';
    this.successMessage = '';
  }

  cancelDetailEdit() {
    this.selectedDetail = null;
  }

  validateCustomDuration() {
    // Matches HH:MM:SS where HH can be 0–99, MM & SS are 00–59
    const regex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;

    if (this.customDuration && !regex.test(this.customDuration)) {
      this.durationError = 'Duration must be in HH:MM:SS format';
    } else {
      this.durationError = '';
    }
  }


  onFileSelected(event: Event, fileInput: HTMLInputElement) {
    if (!this.selectDetail) return;

    this.fileError = '';
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const contentType = this.selectedDetail!.contentType;

      // HTML
      if (contentType === 'html') {
        if (!file.name.toLowerCase().endsWith('.html')) {
          this.fileError = 'Only .html files are allowed for HTML Page.';
          fileInput.value = '';
          return;
        }
      }

      // Video
      if (contentType === 'video') {
        const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv', 'video/avi', 'video/mov'];
        if (!videoTypes.includes(file.type)) {
          this.fileError = 'Only video files (mp4, webm, avi, mov, mkv) are allowed.';
          fileInput.value = '';
          return;
        }
      }

      // SCORM
      if (contentType === 'scorm') {
        if (!file.name.toLowerCase().endsWith('.zip')) {
          this.fileError = 'Only .zip files are allowed for SCORM Package.';
          fileInput.value = '';
          return;
        }
      }

      if (contentType === 'pdf') {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          this.fileError = 'Only .pdf files are allowed for PDF content.';
          fileInput.value = '';
          return;
        }
      }

      // External link
      if (contentType === 'externallink') {
        this.fileError = 'For External Link, file upload is disabled.';
        fileInput.value = '';
        return;
      }

      // ✅ valid
      this.selectedDetail!.file = file;
    }
  }

  deleteTopic(topic: any) {
    const index = this.topics.indexOf(topic);
    if (index > -1 && !topic.saved) {
      this.topics.splice(index, 1);

      // Reset selection if deleted topic was selected
      if (this.selectedTopic === topic) {
        this.selectedTopic = null;
        this.selectedDetail = null;
      }
    }
  }

  deleteDetail(detail: any, topic: any) {
    const index = topic.topicDetails.indexOf(detail);
    if (index > -1 && !detail.saved) {
      topic.topicDetails.splice(index, 1);

      // Reset selection if deleted detail was selected
      if (this.selectedDetail === detail) {
        this.selectedDetail = null;
      }
    }
  }


  NextPage() {
    this.RedirectToSetting.emit();
  }

  openPreview() {
    this.popupConfig = {
      popupFunctionalityType: 'preview',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'Preview Course',
      buttons: [] // Add appropriate button config if needed
    };
  }

  closePreviewPopup() {
    this.popupConfig.isShowPopup = false;
  }
  closePopup(): void {
    this.ngOnInit();
  }

  clearMessage() {
    this.fileError = ''; this.urlError = ''; this.durationError = ''; this.topicTitleError = '';
    this.lessonTitleError = ''; this.successMessage = ''; this.errorMessage = '';
    // reset file input if it exists
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
}
