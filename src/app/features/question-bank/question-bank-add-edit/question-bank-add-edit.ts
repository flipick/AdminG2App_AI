import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionBankService } from '../../../services/questionbank-service';
import { getTenantId } from '../../../services/utility';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { requiredFileType } from '../../../utilities/validation';
import { IQuestionBank } from '../../../model/questionbank';

@Component({
  selector: 'app-question-bank-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-bank-add-edit.html',
  styleUrl: './question-bank-add-edit.css'
})
export class QuestionBankAddEdit implements OnInit {
  id?: number; submitted = false; successMessage = ''; errorMessage: string = '';
  questionBank!: IQuestionBank;
  questionBankForm!: FormGroup;
  get f(): { [key: string]: AbstractControl } {
    return this.questionBankForm.controls;
  }
  constructor(private fb: FormBuilder, private questionBankService: QuestionBankService, private router: Router, private acRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.acRoute.params.subscribe(params => {
      this.id = +params['id'];
      this.questionBankService.getQuestionBankById(this.id).subscribe((data: any) => {
        if (data == undefined || data == null) {
          this.submitted = true
          this.errorMessage += 'No question bank exists for ' + this.id;
        } else {
          this.questionBank = data;
          this.setForm(this.questionBank);
        }
      });
    });
  }

  setForm(questionBank: IQuestionBank)
  {
    this.questionBankForm = this.fb.group({
      questionBankId: [questionBank.questionBankId],
      title:  [{ value: questionBank.title, disabled: this.id! > 0 }, Validators.required],
      tenantId: getTenantId(),
      ImportedFile: ['', [Validators.required, requiredFileType('xlsx,xls')]]
    });
  }

  uploadFileName: any;
  onFileChanged($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      this.uploadFileName = $event.target.files[0].name;
      this.questionBankForm.patchValue({
        ImportedFile: file,
      });
    }
  }
  goBackToList(): void {
    this.router.navigate(['question-bank-list']);
  }

  uploadExcel() {
    this.submitted = true;
    this.questionBankForm.markAllAsTouched();
    if (this.questionBankForm.invalid) { return; }
    if(this.id! == 0){
      this.createQuestionBank();
    }else{
      this.appendQuestionBank();
    }

  }

  createQuestionBank()
  {
    const formData = new FormData();
    formData.append('QuestionBankId', this.questionBankForm.value.questionBankId);
    formData.append('TenantId', getTenantId());
    formData.append('Title', this.questionBankForm.value.title);
    formData.append('ExcelFile', this.questionBankForm.value.ImportedFile);

    this.questionBankService.createQuestionBank(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = 'Questions uploaded successfully';
          this.router.navigate(['question-bank-list']);
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }

  appendQuestionBank()
  {
    const formData = new FormData();
    formData.append('QuestionBankId', this.questionBankForm.value.questionBankId);
    formData.append('TenantId', getTenantId());
    formData.append('Title', this.questionBankForm.value.title);
    formData.append('ExcelFile', this.questionBankForm.value.ImportedFile);

    this.questionBankService.appendQuestionBank(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = 'Questions append successfully';
          this.router.navigate(['question-bank-list']);
        } else {
          this.errorMessage = res.message || 'Unknown error occurred';
        }
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Unknown error occurred';
      }
    });
  }
}
