import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAssessment } from '../../../model/assessment';
import { AssessmentService } from '../../../services/assessment-service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionBankService } from '../../../services/questionbank-service';
import { IQuestionBank } from '../../../model/questionbank';
import { QuestionService } from '../../../services/question-service';
import { IQuestion } from '../../../model/question';

@Component({
  selector: 'app-question-qbank',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-qbank.html',
  styleUrl: './question-qbank.css'
})
export class QuestionQBank implements OnInit, OnChanges {
  String = String;
  @Input() AssessmentId: number = 0;
  @Input() NoOfQuestions: number = 0;
  @Input() QuestionOption: string = '';
  @Input() QuestionBankId: number = 0;
  @Input() EditMode: boolean = false;
  @Input() QuestionSelectionType: string = 'manual';
  @Output() RedirectToReviewAndPublish = new EventEmitter<void>();
  assessment!: IAssessment;
  questionBanks: IQuestionBank[] = [];
  questions: IQuestion[] = [];
  submitted = false; successMessage = ''; errorMessage: string = '';
  contentBuilderForm!: FormGroup;

  constructor(public assessmentService: AssessmentService, public fb: FormBuilder, private router: Router, private acRoute: ActivatedRoute, public questionBankService: QuestionBankService, public questionService: QuestionService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['QuestionOption'] && changes['QuestionOption'].currentValue != '') {
      this.loadData();
    }
  }

  loadData() {
    this.questionBankService.getQuestionBanks().subscribe((response: any) => {
      if (response.success && response.result) {
        this.questionBanks = response.result;
        if (this.QuestionBankId > 0) {
          this.getQuestions(this.QuestionBankId);
        }
      }
    });

    this.contentBuilderForm = this.fb.group({
      assessmentId: [this.AssessmentId, Validators.required],
      questionBankId: [{ value: this.QuestionBankId == 0 || this.QuestionBankId == null ? "" : this.QuestionBankId, disabled: this.EditMode }, Validators.required],
      questions: this.fb.array([]),
      questionSelectionType: [this.QuestionSelectionType ? this.QuestionSelectionType : 'manual']
    });
  }

  get questionsFormArray(): FormArray {
    return this.contentBuilderForm.get('questions') as FormArray;
  }



  minSelectedQuestions(min: number) {
    return (control: import('@angular/forms').AbstractControl) => {
      const formArray = control as FormArray;
      const selectedCount = formArray.controls
        .map(ctrl => ctrl.get('isSelected')?.value)
        .filter(value => value === true).length;

      return selectedCount >= min ? null : { minSelected: true };
    };
  }


  onQuestionBankChange(event: Event): void {
    this.submitted = true; this.errorMessage = ''; this.successMessage = '';
    var selectedQbankId = (event.target as HTMLSelectElement).value;
    this.getQuestions(selectedQbankId);
  }

  onQuestionSelectionChange(event: Event): void {
    var selectedQbankName = (event.target as HTMLSelectElement).value;
    this.applyQuestionSelection();
  }


  getQuestions(qbankId: any) {
    const questionsFormArray = this.contentBuilderForm.get('questions') as FormArray;
    questionsFormArray.clear();
    this.questionService.getQuestionsByQBankAndAssessmentId(parseInt(qbankId), this.AssessmentId).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.result) && res.result.length) {
          this.loadQuestions(res.result);
        }
      },
      error: (err: any) => console.error('Error fetching question:', err)
    });
  }

  loadQuestions(questionsFromApi: IQuestion[]) {
    const questionsFormArray = this.contentBuilderForm.get('questions') as FormArray;
    questionsFormArray.clear();

    questionsFromApi.forEach(q => {
      questionsFormArray.push(this.fb.group({
        questionId: [q.questionId],
        questionText: [q.questionText],
        isSelected: [q.isSelected]
      }));
    });   
  }

  addSelectedQuestionsToAssessment() {
    this.submitted = true; this.errorMessage = ''; this.successMessage = '';
    if (this.contentBuilderForm.invalid) {
      this.errorMessage = 'Please select question option or question bank';
      return;
    }
    const selectedQuestions = (this.contentBuilderForm.get('questions') as FormArray)
      .controls
      .filter(qCtrl => qCtrl.get('isSelected')?.value)
      .map(qCtrl => ({
        QuestionId: qCtrl.get('questionId')?.value,
        IsSelected: qCtrl.get('isSelected')?.value,
        QuestionText: qCtrl.get('questionText')?.value
      }));


    if (this.NoOfQuestions > 0 && selectedQuestions.length !== this.NoOfQuestions) {
      this.errorMessage = `You must select exactly ${this.NoOfQuestions} questions. Currently selected: ${selectedQuestions.length}`;
      return;
    }
    if (selectedQuestions.length === 0) {
      this.errorMessage = 'At least one question must be selected.';
      return;
    }
    const payload = {
      assessmentId: this.contentBuilderForm.get('assessmentId')?.value,
      questionBankId: this.contentBuilderForm.get('questionBankId')?.value,
      questions: selectedQuestions,
      questionOption: this.QuestionOption,
      questionSelectionType: this.contentBuilderForm.get('questionSelectionType')?.value
    };

    console.log('Payload:', payload);

    this.questionService.addUpdateQuestionsToAssessment(payload).subscribe({
        next: (response: any) => {
            if (response.success) {
                this.successMessage = 'Questions saved successfully';
                this.RedirectToReviewAndPublish.next();
                this.submitted = false; 
            } else {
                this.errorMessage = response.message || 'Unknown error occurred';
            }
        },
        error: (error) => {
            this.errorMessage = error.message || 'Unknown error occurred';
        }
    });
  }



  applyQuestionSelection() {
    const selectionType = this.contentBuilderForm.get('questionSelectionType')?.value;
    const questionsFormArray = this.contentBuilderForm.get('questions') as FormArray;

    // Reset all selections first
    questionsFormArray.controls.forEach(ctrl => ctrl.get('isSelected')?.setValue(false));

    const totalQuestions = questionsFormArray.length;

    if (selectionType === 'top') {
      for (let i = 0; i < Math.min(this.NoOfQuestions, totalQuestions); i++) {
        questionsFormArray.at(i).get('isSelected')?.setValue(true);
      }
    }
    else if (selectionType === 'any' || selectionType === 'schedule') {
      const randomIndexes = this.getRandomIndexes(totalQuestions, this.NoOfQuestions);
      randomIndexes.forEach(i => {
        questionsFormArray.at(i).get('isSelected')?.setValue(true);
      });
    }
    else 
    {
      var _questionBankId = this.contentBuilderForm.get('questionBankId')?.value;
      this.getQuestions(_questionBankId);
    }

    // ✅ Force UI refresh
    this.cdRef.detectChanges();
  }


  private getRandomIndexes(total: number, count: number): number[] {
    const indexes = Array.from({ length: total }, (_, i) => i);
    const shuffled = indexes.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, total));
  }
}
