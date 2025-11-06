import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenAIAssessmentService } from '../../../services/openai-assessment-service';
import { QuestionService } from '../../../services/question-service';
import { IOpenAIQuestion } from '../../../model/question';
import { getTenantId } from '../../../services/utility';

@Component({
  selector: 'app-ai-generated-question-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ai-generated-question-bank.html',
  styleUrl: './ai-generated-question-bank.css'
})
export class AiGeneratedQuestionBank implements OnInit {
  @Input() AssessmentId: number = 0;
  @Input() AssessmentName: string = '';
  @Input() NoOfQuestions: number = 0;
  @Input() QuestionOption: string = '';
  @Input() QuestionBankId: number = 0;
  @Input() EditMode: boolean = false;
  @Output() RedirectToReviewAndPublish = new EventEmitter<void>();

  submitted = false; successMessage = ''; errorMessage: string = '';
  selectedFile: File | null = null;
  contentBuilderForm!: FormGroup;
  constructor(private fb: FormBuilder, private openAIAssessmentService: OpenAIAssessmentService, private questionService: QuestionService) { }

  ngOnInit(): void {
    if (this.EditMode && this.QuestionBankId > 0) {
      this.getQuestions(this.QuestionBankId);
    }
    this.contentBuilderForm = this.fb.group({
      assessmentId: [this.AssessmentId, Validators.required],
      questionBankId: [this.QuestionBankId],
      questions: this.fb.array([], this.minSelectedQuestions(1))
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

  getQuestions(qbankId: any) {
    this.questionService.getQuestionsByQBankAndAssessmentId(parseInt(qbankId), this.AssessmentId).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.result) && res.result.length) {
          this.loadQuestions(res.result);
        }
      },
      error: (err: any) => console.error('Error fetching question:', err)
    });
  }

  loadQuestions(questionsFromApi: IOpenAIQuestion[]) {
    const questionsFormArray = this.contentBuilderForm.get('questions') as FormArray;
    questionsFormArray.clear();

    questionsFromApi.forEach(q => {
      questionsFormArray.push(this.fb.group({
        questionId: [q.questionId],
        questionText: [q.questionText],
        a: [q.a],
        b: [q.b],
        c: [q.c],
        d: [q.d],
        answer: [q.answer],
        solution: [q.solution],
        bloomsTaxonomy: [q.bloomsTaxonomy],
        difficultyLevel: [q.difficultyLevel],
        isSelected: [true]
      }));
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


  createOpenAIAssessmentQuestions() {
    this.submitted = true; this.errorMessage = ''; this.successMessage = '';
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a PDF file.';
      return;
    }
    if (this.AssessmentId <= 0) {
      this.errorMessage = 'Please fill assessment details.';
      return;
    }

    const formData = new FormData();
    formData.append('TenantId', getTenantId());
    formData.append('AssessmentName', this.AssessmentName.toString());
    formData.append('AssessmentId', this.AssessmentId.toString());
    formData.append('PdfFile', this.selectedFile);
    formData.append('NoOfQuestions', this.NoOfQuestions == 0 ? "10" : this.NoOfQuestions.toString());
    this.openAIAssessmentService.generateOpenAIAssessmentQuestions(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.errorMessage = ''; this.successMessage = '';
          this.successMessage = 'Assessment questions generated successfully';
          this.loadQuestions(res.result.questions);
          this.contentBuilderForm.patchValue({
            questionBankId: res.result.questionBankId
          });
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }


  addSelectedQuestionsToAssessment() {
    this.submitted = true; this.errorMessage = ''; this.successMessage = '';
    if (this.contentBuilderForm.invalid) {
      this.errorMessage = 'Please select assessment, question bank, and at least one question.';
      return;
    }
    const selectedQuestions = (this.contentBuilderForm.get('questions') as FormArray)
      .controls
      .filter(qCtrl => qCtrl.get('isSelected')?.value)
      .map(qCtrl => ({
        QuestionId: qCtrl.get('questionId')?.value,
        IsSelected: qCtrl.get('isSelected')?.value,
        QuestionText: qCtrl.get('questionText')?.value,
        A: qCtrl.get('a')?.value,
        B: qCtrl.get('b')?.value,
        C: qCtrl.get('c')?.value,
        D: qCtrl.get('d')?.value,
        Answer: qCtrl.get('answer')?.value,
        Solution: qCtrl.get('solution')?.value,
        BloomsTaxonomy: qCtrl.get('bloomsTaxonomy')?.value,
        DifficultyLevel: qCtrl.get('difficultyLevel')?.value
      }));

    if (selectedQuestions.length === 0) {
      this.errorMessage = 'At least one question must be selected.';
      return;
    }

    const payload = {
      assessmentId: this.contentBuilderForm.get('assessmentId')?.value,
      questionBankId: this.contentBuilderForm.get('questionBankId')?.value,
      questions: selectedQuestions,
      questionOption: this.QuestionOption
    };

    console.log('Payload:', payload);

    this.questionService.addUpdateQuestionsToAssessment(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.errorMessage = ''; this.successMessage = '';
          this.successMessage = 'Questions saved successfully';
          this.RedirectToReviewAndPublish.next();
          this.submitted = false;
        } else {
          this.errorMessage = response.message || 'Unknown error occurred';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Unknown error occurred';
      }
    });
  }
}
