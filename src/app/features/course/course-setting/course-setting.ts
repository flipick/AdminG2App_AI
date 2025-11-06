import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../services/course-service';
import { ICourse } from '../../../model/course';
import { IEnrollmentSetting } from '../../../model/enrollmentsetting';
import { EnrollmentSettingsService } from '../../../services/enrollmentsetting-service';

@Component({
  selector: 'app-course-setting',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-setting.html',
  styleUrl: './course-setting.css'
})
export class CourseSetting implements OnInit {
  @Input() courseId: number = 0;  
  course!: ICourse;
  submitted = false; successMessage = ''; errorMessage: string = '';
  enrollmentSettings: IEnrollmentSetting[] = [];

  constructor(public fb: FormBuilder, private acRoute: ActivatedRoute, private courseService: CourseService,  private enrollmentSettingsService: EnrollmentSettingsService,) { }

  SetiingForm!: FormGroup;

  get f(): { [key: string]: AbstractControl } {
    return this.SetiingForm.controls;
  }
  ngOnInit(): void {
    if (this.courseId) {
      this.getEnrollmentSettings();
      this.loadCourse();
    }
  }
  getEnrollmentSettings(): void {
    this.enrollmentSettingsService.getEnrollmentSettings().subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          this.enrollmentSettings = res.result;
        }
      },
      error: (err: any) => {
        console.error('Error fetching enrollment settings:', err);
      }
    })
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
    this.SetiingForm = this.fb.group({
      enrollmentId: [course?.enrollmentId || '', [Validators.required]],
      status: [course?.status || 'draft'],
      isTrackLearnerProgess: [course?.isTrackLearnerProgess],
      isTrackTimeSpent: [course?.isTrackTimeSpent],
      isTrackAssessmentScores: [course?.isTrackAssessmentScores],
      certificationSetting: [course?.certificationSetting || '']
    });  
  }

  saveCourseSetting(): void {
    this.successMessage = ''; this.errorMessage = '';
    this.submitted = true;
    if (this.SetiingForm.invalid) {
      return;
    }
    const formValues = this.SetiingForm.value;
    const courseData: ICourse = {
      ...formValues,
      courseId: this.courseId ?? 0,
      enrollmentId: formValues.enrollmentId ? +formValues.enrollmentId : 0,
      isTrackLearnerProgess: !!formValues.isTrackLearnerProgess,
      isTrackTimeSpent: !!formValues.isTrackTimeSpent,
      isTrackAssessmentScores: !!formValues.isTrackAssessmentScores
    };

    console.log("Update Course Setting Data: " + courseData);

    this.courseService.updateCourseSetting(courseData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.courseId = res.result;
          this.successMessage = 'Course saved successfully';
        }
        else {
          this.errorMessage = 'An error occurred while saving the course.';
          console.error('Save failed: ' + res.message);
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while saving the course.';
        console.error('Error saving course:', err);
      }
    });
  }
}
