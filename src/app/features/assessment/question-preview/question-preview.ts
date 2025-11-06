import { Component, Input, OnInit } from '@angular/core';
import { IQuestion } from '../../../model/question';
import { QuestionService } from '../../../services/question-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AIAssessmentService } from '../../../services/aiassessment-service';
import { IAIQuestion } from '../../../model/aiassessment';


@Component({
  selector: 'app-question-preview',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-preview.html',
  styleUrl: './question-preview.css'
})
export class QuestionPreview implements OnInit {
  @Input() assessmentId!: number;
  @Input() assessmentTypeId!: number;
  @Input() QuestionOption: string = '';
  @Input() QuestionBankId: number = 0;
  questions: IQuestion[] = [];
  aiQuestions: IAIQuestion[] = [];
  constructor(private questionService: QuestionService, private aiAssessmentService: AIAssessmentService) { }

  ngOnInit(): void {
    if (this.assessmentId) {
      if (this.assessmentTypeId == 2) {
        this.loadAIQuestions();
      }
      else {
        if (this.QuestionOption == "QuestionBank") {
          this.loadQuestionBankQuestions();
        }
        else { this.loadQuestions(); }
      }
    }
  }



  loadQuestions(): void {
    this.questionService.getQuestionByAssessmentId(this.assessmentId)
      .subscribe((res: any) => {

        // helper to normalize text
        function normalize(val: string): string {
          return val?.toLowerCase().trim() || '';
        }

        function isTrueFalseLike(options: { optionText: string }[]): boolean {
          if (options.length !== 2) return false;

          const texts = options.map(o => normalize(o.optionText));

          const validPairs = [
            ['true', 'false'],
            ['yes', 'no'],
            ['y', 'n'],
            ['t', 'f'],
            ['correct', 'incorrect'],
            ['right', 'wrong']
          ];

          return validPairs.some(([a, b]) =>
            (texts.includes(a) && texts.includes(b))
          );
        }

        this.questions = res.result.map((q: any) => {
          // Normalize answer into array of letters
          let correctAnswers: string[] = [];

          if (Array.isArray(q.answer)) {
            correctAnswers = q.answer.map((a: any) => a.trim().toUpperCase());
          } else if (typeof q.answer === 'string') {
            correctAnswers = q.answer.split(',').map((a: any) => a.trim().toUpperCase());
          }

          const rawOptions = [q.a, q.b, q.c, q.d, q.e, q.f];
          const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

          const options = rawOptions
            .filter(opt => !!opt) // only keep non-null
            .map((opt, idx) => ({
              optionLetter: optionLetters[idx],     // A, B, C...
              optionText: opt,                      // actual text like "abc"
              isCorrect: correctAnswers.includes(optionLetters[idx])
            }));

          return {
            questionText: q.questionText,
            options,
            isTrueFalse: isTrueFalseLike(options)
          };
        });
      });
  }

  loadAIQuestions() {
    this.aiAssessmentService.getAIQuestionByAssessmentId(this.assessmentId).subscribe({
      next: (response: any) => {
        if (response && response.success && response.result?.length > 0) {
          this.aiQuestions = response.result;
        }
      },
      error: (error) => {
        console.log(error.message || 'Unknown error occurred');
      }
    });
  }

  loadQuestionBankQuestions(): void {
    this.questionService.getQuestionByAssessmentAndQBankId(this.assessmentId, this.QuestionBankId)
      .subscribe((res: any) => {

        // helper to normalize text
        function normalize(val: string): string {
          return val?.toLowerCase().trim() || '';
        }

        function isTrueFalseLike(options: { optionText: string }[]): boolean {
          if (options.length !== 2) return false;

          const texts = options.map(o => normalize(o.optionText));

          const validPairs = [
            ['true', 'false'],
            ['yes', 'no'],
            ['y', 'n'],
            ['t', 'f'],
            ['correct', 'incorrect'],
            ['right', 'wrong']
          ];

          return validPairs.some(([a, b]) =>
            (texts.includes(a) && texts.includes(b))
          );
        }

        this.questions = res.result.map((q: any) => {
          // Normalize answer into array of letters
          let correctAnswers: string[] = [];

          if (Array.isArray(q.answer)) {
            correctAnswers = q.answer.map((a: any) => a.trim().toUpperCase());
          } else if (typeof q.answer === 'string') {
            correctAnswers = q.answer.split(',').map((a: any) => a.trim().toUpperCase());
          }

          const rawOptions = [q.a, q.b, q.c, q.d, q.e, q.f];
          const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

          const options = rawOptions
            .filter(opt => !!opt) // only keep non-null
            .map((opt, idx) => ({
              optionLetter: optionLetters[idx],     // A, B, C...
              optionText: opt,                      // actual text like "abc"
              isCorrect: correctAnswers.includes(optionLetters[idx])
            }));

          return {
            questionText: q.questionText,
            options,
            isTrueFalse: isTrueFalseLike(options)
          };
        });
      });
  }
}
