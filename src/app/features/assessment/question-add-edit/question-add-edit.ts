import { CommonModule } from '@angular/common';
import { ViewChildren, QueryList, ElementRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IQuestionType } from '../../../model/question';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../../services/question-service';
import { IAssessment } from '../../../model/assessment';
import { AssessmentService } from '../../../services/assessment-service';

@Component({
  selector: 'app-question-add-edit',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-add-edit.html',
  styleUrl: './question-add-edit.css'
})
export class QuestionAddEdit implements OnInit {
  String = String;
  @Input() AssessmentId: number = 0;
  @Input() NoOfQuestions: number = 0;
  @Output() RedirectToReviewAndPublish = new EventEmitter<void>();
  questionTypes: IQuestionType[] = [];
  submitted = false; successMessage = ''; errorMessage: string = '';
  questionCounter = 0;
  contentBuilderForm!: FormGroup;
  singleAnswerType: string = ''; multipleAnswerType: string = ''; trueFalseType: string = '';
  @ViewChildren('questionItem') questionItems!: QueryList<ElementRef>;

  get questions(): FormArray {
    return this.contentBuilderForm.get('questions') as FormArray;
  }

  constructor(public fb: FormBuilder, private router: Router, private acRoute: ActivatedRoute,
    private questionService: QuestionService, private assessmentService: AssessmentService, private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getQuestionsTypes();
  }

  getQuestionsTypes(): void {
    this.questionService.getQuestionTypes().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.questionTypes = res.result;
          this.singleAnswerType = this.questionTypes.find(q => q.questionTypeName === 'Multiple Choice (Single Answer)')?.questionTypeId?.toString() ?? '';
          this.multipleAnswerType = this.questionTypes.find(q => q.questionTypeName === 'Multiple Choice (Multiple Answers)')?.questionTypeId.toString() ?? '';
          this.trueFalseType = this.questionTypes.find(q => q.questionTypeName === 'True/False')?.questionTypeId.toString() ?? '';
          if (this.AssessmentId > 0) {
            this.initContentBuilderForm();
          } else {
            this.errorMessage = 'Assessment not found';
          }
        }
      }
    });
  }

  initContentBuilderForm() {
    this.contentBuilderForm = this.fb.group({
      questions: this.fb.array([])
    });

    if (this.AssessmentId && this.AssessmentId > 0) {
      this.questionService.getQuestionByAssessmentId(this.AssessmentId).subscribe({
        next: (res: any) => {
          if (res?.success && Array.isArray(res.result) && res.result.length) {
            res.result.forEach((q: any) => {
              const optionKeys = ['a', 'b', 'c', 'd', 'e', 'f'];

              // Convert answers to uppercase letters (A, B, C...)
              const answersArray =
                q.questionTypeId === 2
                  ? (q.answer ? q.answer.split(',').map((a: string) => a.trim().toUpperCase()) : [])
                  : [q.answer?.trim()?.toUpperCase()]; 

              // Build options with correct answer mapping
              const optionsArray = optionKeys
                .map((key, idx) => {
                  const val = q[key];
                  if (val) {
                    const letter = String.fromCharCode(65 + idx); // A, B, C...
                    return this.createOption(val, answersArray.includes(letter));
                  }
                  return null;
                })
                .filter(opt => opt !== null);

              this.questions.push(
                this.fb.group({
                  questionId: [q.questionId],
                  assessmentId: [q.assessmentId],
                  questionTypeId: [q.questionTypeId, Validators.required],
                  questionText: [q.questionText, Validators.required],
                  correctAnswer: [answersArray], // store letters A,B,C
                  points: [q.points || 0, Validators.required],
                  explanation: [q.explanation || ''],
                  options: this.fb.array(optionsArray)
                })
              );
            });
          } else {
            this.addNewQuestion();
          }
        },
        error: () => this.addNewQuestion()
      });
    } else {
      this.addNewQuestion();
    }
  }


  createOption(value: string = '', selected: boolean = false): FormGroup {
    return this.fb.group({
      value: [value, Validators.required],   // <-- must pass Option A, B etc.
      selected: [selected]
    });
  }

  addNewQuestion() {
    this.questionCounter++;
    // Default to single answer if nothing else matches
    const defaultTypeId = this.singleAnswerType ?? "0";

    // Default options based on type
    let optionsArray: FormArray;
    if (this.multipleAnswerType && defaultTypeId === this.multipleAnswerType) {
      optionsArray = this.fb.array([
        this.createOption(''),
        this.createOption(''),
        this.createOption(''),
        this.createOption('')
      ]);
    } else if (this.trueFalseType && defaultTypeId === this.trueFalseType) {
      optionsArray = this.fb.array([
        this.createOption('True'),
        this.createOption('False')
      ]);
    } else {
      // Single Answer default
      optionsArray = this.fb.array([
        this.createOption('', true),
        this.createOption(''),
        this.createOption(''),
        this.createOption('')
      ]);
    }

    const questionForm = this.fb.group({
      questionCounterid: [this.questionCounter],
      assessmentId: [this.AssessmentId],
      questionTypeId: [defaultTypeId, Validators.required],
      questionText: ['', Validators.required],
      correctAnswer: [0],
      points: [10, Validators.required],
      explanation: [''],
      options: optionsArray
    });

    this.questions.push(questionForm);

    setTimeout(() => {
      const lastQuestion = this.questionItems.last;
      if (lastQuestion) {
        lastQuestion.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }


  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(qIndex: number): FormArray {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  selectCorrectAnswer(qIndex: number, oIndex: number) {
    const typeId = parseInt(this.questions.at(qIndex).get('questionTypeId')?.value);
    const options = this.getOptions(qIndex);

    if (typeId === 2) {
      // Toggle for multiple answer
      const currentValue = options.at(oIndex).get('selected')?.value;
      options.at(oIndex).get('selected')?.setValue(!currentValue);

      // Store all selected indexes
      const selectedIndexes = options.controls
        .map((opt, i) => opt.get('selected')?.value ? i : -1)
        .filter(i => i !== -1);

      this.questions.at(qIndex).get('correctAnswer')?.setValue(selectedIndexes);
    } else {
      // Single Answer (Radio)
      options.controls.forEach((opt, i) => opt.get('selected')?.setValue(i === oIndex));
      this.questions.at(qIndex).get('correctAnswer')?.setValue(oIndex);
    }
  }


  updateQuestionType(qIndex: number) {
    const questionForm = this.questions.at(qIndex) as FormGroup;
    const typeId = questionForm.get('questionTypeId')?.value;

    let newOptions: FormArray;

    if (typeId === this.trueFalseType) {
      newOptions = this.fb.array([
        this.createOption('True', true),
        this.createOption('False')
      ]);
      questionForm.get('correctAnswer')?.setValue(0);
    }
    else if (typeId === this.multipleAnswerType) {
      newOptions = this.fb.array(
        ['', '', '', '']
          .map(opt => this.createOption(opt))
      );
      questionForm.get('correctAnswer')?.setValue(null);
    }
    else if (typeId === this.singleAnswerType) {
      newOptions = this.fb.array(
        ['', '', '', '']
          .map((opt, idx) => this.createOption(opt, idx === 0)) // first one selected
      );
      questionForm.get('correctAnswer')?.setValue(0);
    }
    else {
      newOptions = this.fb.array([]);
    }

    questionForm.setControl('options', newOptions);
    this.cdRef.detectChanges();
  }




  submitQuestions() {
    this.submitted = true; this.errorMessage = ''; this.successMessage ='';
    if (this.NoOfQuestions == 0){
      this.errorMessage = "No Of Questions should be grater thant 0";
      return;
    }
    if (this.contentBuilderForm.invalid || !this.AssessmentId) return;
    var payload = this.getPayload();
    console.log("payload: " + JSON.stringify(payload));
    this.questionService.addUpdateQuestion(payload).subscribe({
      next: (response: any) => {
        
        if (response && response.success) {
           this.submitted = false;
          this.successMessage = 'Questions saved successfully';
          this.RedirectToReviewAndPublish.next();
        } else {
          this.errorMessage = response.message || 'Unknown error occurred';
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Unknown error occurred';
      }
    });
  }

  getPayload(): any {
    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    const questionsPayload = this.questions.value.map((q: any) => {
      const options = q.options.map((opt: any) => ({
        value: opt.value ?? null,
        selected: !!opt.selected
      }));

      let correctAnswerValue: string | null = null;

      if (q.questionTypeId === this.singleAnswerType) {
        const idx = q.options.findIndex((o: any) => o.selected);
        correctAnswerValue = idx >= 0 ? optionLetters[idx] : null;
      } else if (q.questionTypeId === this.multipleAnswerType) {
        const selectedValues = q.options
          .map((o: any, i: number) => o.selected ? optionLetters[i] : null)
          .filter((v: string | null) => v !== null);
        correctAnswerValue = selectedValues.length ? selectedValues.join(',') : null;
      } else if (q.questionTypeId === this.trueFalseType) {
        const idx = q.options.findIndex((o: any) => o.selected);
        correctAnswerValue = idx >= 0 ? optionLetters[idx] : null;
      }

      return {
        questionCounterid: q.questionCounterid || 0,  // <-- keep this property name consistent everywhere
        questionId: q.questionId || 0,
        assessmentId: this.AssessmentId,
        questionTypeId: q.questionTypeId,
        questionText: q.questionText,
        correctAnswer: correctAnswerValue,
        points: q.points || 0,
        explanation: q.explanation || '',
        options,
        status: 1
      };
    });

    return { assessmentId: this.AssessmentId, questions: questionsPayload };
  }


  onOptionValueChange(qIndex: number, oIndex: number, newValue: string) {
    const question = this.questions.at(qIndex) as FormGroup;
    const typeId = question.get('questionTypeId')?.value;

    if (typeId === this.multipleAnswerType) {
      const option = this.getOptions(qIndex).at(oIndex) as FormGroup;
      option.get('value')?.setValue(newValue);

      const selectedValues = this.getOptions(qIndex).controls
        .filter(opt => opt.get('selected')?.value)
        .map(opt => opt.get('value')?.value);

      question.get('correctAnswer')?.setValue(
        selectedValues.length > 0 ? selectedValues.join(',') : null
      );
    }
  }
}
