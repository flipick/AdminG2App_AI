import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../services/course-service';
import { CommonModule } from '@angular/common';
import { ICourse } from '../../../model/course';
import { PreviewCourse } from '../../../features-popup/preview-course/preview-course';
import { PopupConfig } from '../../../model/popupconfig';
import { Popup } from '../../../shared/popup/popup';


@Component({
  selector: 'app-content-management',
  imports: [CommonModule,FormsModule, ReactiveFormsModule, Popup, PreviewCourse],
  templateUrl: './content-management.html',
  styleUrl: './content-management.css'
})
export class ContentManagement implements OnInit {  
  @Input() courseId: number = 0;  
  course!: ICourse; courseType: string = '';
  @Output() RedirectToSetting = new EventEmitter<string>();
  submitted = false; successMessage = ''; errorMessage: string = '';
  selectedFile: File | null = null;
  ContentForm!: FormGroup;
  selectedPreviewUrl: string = '';
  popupConfig: PopupConfig = new PopupConfig();

  get f(): { [key: string]: AbstractControl } {
    return this.ContentForm.controls;
  }

  constructor(public fb: FormBuilder,  private acRoute: ActivatedRoute,  private courseService: CourseService) {

   }

  ngOnInit(): void {
    this.popupConfig.isShowPopup = false;
    if (this.courseId) {
      this.loadCourse();
    }
  }
    loadCourse(): void {
      this.courseService.getCourse(this.courseId).subscribe((data: any) => {
        if (data == undefined || data == null) {
          this.submitted = true
          this.errorMessage += 'No course exists for ' + this.courseId;
        } else {
          this.course = data;
          this.setForm(this.course);
        }
      });
  }
  
setForm(course?: ICourse) {
    this.courseType = this.course.courseType;
    this.ContentForm = this.fb.group({
      courseTypeUrl: [course!.courseTypeUrl, [Validators.required]]
    });  
  }
  isDragging = false;
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        this.selectedFile = file;
      } else {
        alert('Only .zip files are allowed.');
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      this.selectedFile = file;
    } else {
      this.errorMessage = "Only .zip (SCORM) files are allowed.";
    }
  }

  uploadScorm() {
    this.successMessage = ''; this.errorMessage='';
    this.submitted = true;
    if(!this.selectedFile){
      this.RedirectToSetting.emit();      
      return;
    }
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a SCORM package to upload.';      
      return;
    }
    if(this.courseId! <= 0)
    {
      this.errorMessage = 'Please fill course details.';      
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('courseId', this.courseId!.toString());
    this.courseService.uploadScorm(formData).subscribe({
      next: (response: any) => {
        if (response && response.success === true) {
          console.log('scorm uploaded successfully:', response);
          this.successMessage = 'scorm uploaded successfully';
          this.RedirectToSetting.emit();  
        } else {
          this.errorMessage = response.message || 'Unknown error occurred';         
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Unknown error occurred';        
      },
    });    
  }


  onPdfSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Only PDF files are allowed.';
      this.selectedFile = null;
    }
  }

  uploadPdf() {
    this.submitted = true;
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a PDF file.';
      return;
    }
    if (this.courseId <= 0) {
      this.errorMessage = 'Please fill course details.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('courseId', this.courseId.toString());

    this.courseService.uploadPdf(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = 'PDF uploaded successfully';
          this.RedirectToSetting.emit();
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }

  saveUrl() {
    this.submitted = true;
    if (this.ContentForm.invalid) return;
    var param = {
      CourseId: this.courseId,
      Url: this.ContentForm.value.courseTypeUrl

    }
    this.courseService.saveCourseUrl(param).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = 'URL saved successfully';
          this.RedirectToSetting.emit();
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }

  openPreview(previewUrl: any): void {
    this.selectedPreviewUrl = previewUrl;
    this.popupConfig = {
      popupFunctionalityType: 'preview',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'Preview Course',
      buttons: []
    };
  }


  closePopup(): void {
    this.ngOnInit();
  }
 getFileNameFromUrl(url: string): string {
    if (!url) return '';

    const cleanUrl = url.split('?')[0];
    const segments = cleanUrl.split('/');
    return segments.length > 0 ? segments[segments.length - 1] : '';
  }
}
