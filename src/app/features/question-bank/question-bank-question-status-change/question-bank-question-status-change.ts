import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IQuestionStatus } from '../../../model/question';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../../services/question-service';

@Component({
  selector: 'app-question-bank-question-status-change',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './question-bank-question-status-change.html',
  styleUrl: './question-bank-question-status-change.css'
})
export class QuestionBankQuestionStatusChange {
  id?: number; submitted = false; successMessage = ''; errorMessage: string = '';
  questions: IQuestionStatus[] = [];

  constructor(private router: Router, private acRoute: ActivatedRoute, private questionService: QuestionService) { }

  ngOnInit(): void {
    this.acRoute.params.subscribe(params => {
      this.id = +params['id'];
      this.questionService.getQuestionsByQuestionBankId(this.id).subscribe((data: any) => {
        if (data == undefined || data == null) {
          this.submitted = true
          this.errorMessage += 'No question exists for ' + this.id;
        } else {
          this.questions = data.result;
        }
      });
    });
  }
  goBackToList(): void {
    this.router.navigate(['question-bank-list']);
  }
  toggleStatus(question: any) {
    // Toggle between 0 (Draft) and 1 (Approve)
    question.status = question.status === 1 ? 0 : 1;

    // Optional: Call API to update status in backend
    this.questionService.updateStatus(question).subscribe({
      next: (res: any) => {
        console.log('Status updated successfully');
        this.ngOnInit();
      },
      error: (err: any) => {
        console.error('Error updating status', err);
      }
    });
  }
}
