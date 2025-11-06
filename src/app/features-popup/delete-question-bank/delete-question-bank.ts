import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionBankService } from '../../services/questionbank-service';

@Component({
  selector: 'app-delete-question-bank',
  imports: [],
  templateUrl: './delete-question-bank.html',
  styleUrl: './delete-question-bank.css'
})
export class DeleteQuestionBank {

  @Input() questionBankId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private questionBankService: QuestionBankService) { }

  confirmDelete(): void {
    if (!this.questionBankId) return;

    this.questionBankService.deleteQuestionBank(this.questionBankId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deleted.emit();
        } else {
          console.log('Failed to delete question bank: ' + res.message);
        }
      },
      error: (err: any) => {
        console.error('Delete error:', err);
        console.log('An error occurred while deleting the question bank.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }

}
