import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IAssessment } from '../../../model/assessment';
import { IQuestionBank } from '../../../model/questionbank';
import { IAdaptiveAssessment } from '../../../model/question';
import { AssessmentService } from '../../../services/assessment-service';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionBankService } from '../../../services/questionbank-service';
import { QuestionService } from '../../../services/question-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-adaptive-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './adaptive-assessment.html',
  styleUrl: './adaptive-assessment.css'
})
export class AdaptiveAssessment implements OnInit {
  @Input() AssessmentId: number = 0;
  @Input() QuestionBankId: number = 0;
  @Input() QuestionOption: string = '';
  @Input() EditMode: boolean = false;
  @Output() RedirectToReviewAndPublish = new EventEmitter<void>();
  submitted = false; successMessage = ''; errorMessage: string = '';
  questionBanks: IQuestionBank[] = [];
  contentBuilderForm!: FormGroup;

  constructor(private fb: FormBuilder,  private router: Router,  private acRoute: ActivatedRoute, private questionBankService: QuestionBankService,
    private questionService: QuestionService, private cdRef: ChangeDetectorRef ) { }

  ngOnInit(): void {

    this.questionBankService.getQuestionBanks().subscribe((response: any) => {
      if (response.success && response.result) {
        this.questionBanks = response.result;
        if (this.QuestionBankId > 0) {
          this.getAdaptiveAssessmentDetails(this.QuestionBankId);
        }
      }
    });

    this.contentBuilderForm = this.fb.group({
      assessmentId: [this.AssessmentId, Validators.required],
      questionBankId: [{ value: this.QuestionBankId == 0 ? "" : this.QuestionBankId, disabled: this.EditMode }, Validators.required],
      adaptiveAssessments: this.fb.array([])
    });
  }

  get adaptiveAssessments(): FormArray {
    return this.contentBuilderForm.get('adaptiveAssessments') as FormArray;
  }

  onQuestionBankChange(event: Event): void {
    var selectedQbankId = (event.target as HTMLSelectElement).value;
    this.getAdaptiveAssessmentDetails(selectedQbankId);
  }

  getAdaptiveAssessmentDetails(qbankId: any): void {
    this.questionService.getAdaptiveAssementByQBankAndAssessmentId(parseInt(qbankId), this.AssessmentId).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.result)) {
          this.adaptiveAssessments.clear();
          res.result.forEach((item: IAdaptiveAssessment) => {
            this.loadAdaptiveAssessmentForm(res.result)
          });
          this.cdRef.detectChanges();
        }
      },
      error: (err: any) => console.error('Error fetching adaptive assessments:', err)
    });
  }
  
  loadAdaptiveAssessmentForm(adaptiveAssessmentsFromApi: IAdaptiveAssessment[]) {
    const controls = adaptiveAssessmentsFromApi.map(a => {
      return this.fb.group({
        adaptiveAssessmentId: [a.adaptiveAssessmentId],
        assessmentId: [a.assessmentId],
        difficultyLevel: [a.difficultyLevel],
        correctAnswerMarks: [a.correctAnswerMarks, a.isSelected ? Validators.required : []],
        incorrectAnswerMarks: [a.incorrectAnswerMarks],
        isSelected: [a.isSelected],
        flag: [a.flag],
        totalRowCount: [a.totalRowCount]
      });
    });

    this.contentBuilderForm.setControl('adaptiveAssessments', this.fb.array(controls));

    // Set dynamic validation on isSelected change
    this.adaptiveAssessments.controls.forEach(ctrl => {
      ctrl.get('isSelected')?.valueChanges.subscribe(isSelected => {
        const correctMarksCtrl = ctrl.get('correctAnswerMarks');
        if (isSelected) {
          correctMarksCtrl?.setValidators([Validators.required]);
        } else {
          correctMarksCtrl?.clearValidators();
        }
        correctMarksCtrl?.updateValueAndValidity();
      });
    });

    this.cdRef.detectChanges();
  }

  saveAdaptiveAssessments(): void {
    this.submitted = true; this.errorMessage=''; this.successMessage='';
      if (this.contentBuilderForm.invalid) {          
          return;
      }

    const selectedAssessments = this.adaptiveAssessments.controls
      .filter(c => c.value.isSelected)
      .map(c => ({
        adaptiveAssessmentId: c.value.adaptiveAssessmentId,
        assessmentId: c.value.assessmentId,
        difficultyLevel: c.value.difficultyLevel,
        correctAnswerMarks: c.value.correctAnswerMarks,
        incorrectAnswerMarks: c.value.incorrectAnswerMarks,
        isSelected: c.value.isSelected,
        flag: c.value.flag,
        totalRowCount: c.value.totalRowCount
      }));

    const payload = {
      assessmentId: parseInt(this.contentBuilderForm.get('assessmentId')?.value),
      questionBankId: parseInt(this.contentBuilderForm.get('questionBankId')?.value),
      adaptiveAssessments: selectedAssessments,
       questionOption: this.QuestionOption
    };

    this.questionService.saveAdaptiveAssessments(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = "Adaptive Assessments saved successfully";
          this.RedirectToReviewAndPublish.next();
        } else {
          this.errorMessage = 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        console.error('Save error:', err);
        this.errorMessage = 'Unknown error occurred';
      }
    });
  }

  starsArray = Array(6);
}
