import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AIAssessmentService } from '../../../services/aiassessment-service';
import { IAIQuestion, IAssessmentAgentResponse, IAssessmentQuestionResponse } from '../../../model/aiassessment';
import { LoaderService } from '../../../services/loader-service';

@Component({
  selector: 'app-role-play-scenario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './role-play-scenario.html',
  styleUrls: ['./role-play-scenario.css']
})
export class RolePlayScenario implements OnInit {
  @Input() AssessmentId: number = 0;
  @Input() AssessmentName: string = '';
  @Input() NoOfQuestions: number = 0;
  @Output() RedirectToReviewAndPublish = new EventEmitter<void>();

  submitted = false;
  successMessage = '';
  errorMessage: string = '';
  selectedFile: File | null = null;

  agentResp!: IAssessmentAgentResponse;
  questionsResp!: IAssessmentQuestionResponse;
  aiQuestions: IAIQuestion[] = [];

  rolePlayScenarioForm!: FormGroup;

  constructor(private fb: FormBuilder, private aiAssessmentService: AIAssessmentService, private loaderService: LoaderService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initRolePlayScenarioForm();
  }

  get questions(): FormArray {
    return this.rolePlayScenarioForm.get('questions') as FormArray;
  }

  private initRolePlayScenarioForm() {
    this.rolePlayScenarioForm = this.fb.group({
      questions: this.fb.array([])
    });

    if (this.AssessmentId > 0) {
      this.aiAssessmentService.getAIQuestionByAssessmentId(this.AssessmentId).subscribe({
        next: (response: any) => {
          if (response && response.success && response.result?.length > 0) {
            this.aiQuestions = response.result;
            this.questions.clear();
            this.populateQuestionsForm(this.aiQuestions);
          }
        },
        error: (error) => {
          console.log(error.message || 'Unknown error occurred');
        }
      });
    }
  }

  private populateQuestionsForm(questions: IAIQuestion[]) {
    questions.forEach(q => {
      this.questions.push(
        this.fb.group({
          aiQuestionid: [q.aiQuestionid],
          assessmentId: [q.assessmentId],
          noOfQuestions: [q.noOfQuestions],
          question: [q.question, Validators.required],
          assessmentTitle: [q.assessmentTitle]
        })
      );
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


  createAIAssessmentAgentAndQuestions() {
    this.submitted = true;
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a PDF file.';
      return;
    }
    if (this.AssessmentId <= 0) {
      this.errorMessage = 'Please fill assessment details.';
      return;
    }

    const formData = new FormData();
    formData.append('AssessmentId', this.AssessmentId.toString());
    formData.append('AgentName', this.AssessmentName);
    formData.append('PdfFile', this.selectedFile);
    formData.append('TagName', this.AssessmentName);
    formData.append('NoOfQuestions', this.NoOfQuestions == 0 ? "10" : this.NoOfQuestions.toString());
    this.aiAssessmentService.createAIAssessmentAgentAndQuestions(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = 'Assessment questions generated successfully';
          this.questionsResp = res.result;
          this.questions.clear();

          if (this.questionsResp.questions?.length > 0) {
            this.aiQuestions = this.questionsResp.questions.map((q: string, index: number) => ({
              aiQuestionid: 0,
              assessmentId: this.AssessmentId,
              noOfQuestions: this.questionsResp.questions.length,
              question: q,   // since it's a string[]
              assessmentTitle: this.AssessmentName
            }));
            this.populateQuestionsForm(this.aiQuestions);
          }
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }

  saveQuestions() {
    if (this.rolePlayScenarioForm.invalid) {
      this.errorMessage = 'Please fix errors in the form.';
      return;
    }

    const requestPayload = {
      assessmentId: this.AssessmentId,
      questions: this.rolePlayScenarioForm.value.questions
    };

    this.aiAssessmentService.manageAIQuestions(requestPayload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = 'Questions saved successfully';
          this.errorMessage = '';
          this.RedirectToReviewAndPublish.emit();
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }
}
