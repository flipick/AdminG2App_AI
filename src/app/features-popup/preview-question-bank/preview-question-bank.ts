import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IQuestions } from '../../model/question';
import { QuestionService } from '../../services/question-service';

@Component({
  selector: 'app-preview-question-bank',
  imports: [],
  templateUrl: './preview-question-bank.html',
  styleUrl: './preview-question-bank.css'
})
export class PreviewQuestionBank implements OnInit {
  @Input() questionBankId!: number;
  @Output() close = new EventEmitter<void>();
  questions: IQuestions[] = [];
  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    if (this.questionBankId > 0) {
      this.loadQuestions();
    }
  }

  loadQuestions() {
    this.questionService.getQuestionsByQuestionBankId(this.questionBankId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.questions = res.result;         
        }
      },
      error: (err: any) => { console.error('Error fetching questions:', err); }
    });
  }
}
