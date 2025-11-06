import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDepartment } from '../../model/department';
import { DepartmentService } from '../../services/department-service';
import { IAssessment } from '../../model/assessment';

@Component({
  selector: 'app-assign-assessment-to-department',
  imports: [],
  templateUrl: './assign-assessment-to-department.html',
  styleUrl: './assign-assessment-to-department.css'
})
export class AssignAssessmentToDepartment implements OnInit {
  @Input() Assessments: IAssessment[] = [];
  @Input() TenantId: string = '';
  @Output() close = new EventEmitter<void>();
  departments: IDepartment[] = [];
  selectedDepartmentIds: number[] = [];
  submitted = false; successMessage = ''; errorMessage: string = '';
  constructor(private departmentService: DepartmentService){}

  ngOnInit(): void {
    this.getDepartments();
  }
  ngOnChanges() {
    console.log('Received Assessment:', this.Assessments);
  }
  getDepartments(){
    this.departmentService.getDepartmentsByTenant(this.TenantId).subscribe({
      next: (res: any)=>{
        if(res.success){
          this.departments = res.result;
        }
      },
      error: (err: any) => console.error('Error while fetching departments:', err)
    });
  }

  toggleDepartmentSelection(departmentId: number, event: Event) {
      const checked = (event.target as HTMLInputElement).checked;
      if (checked) {
          if (!this.selectedDepartmentIds.includes(departmentId)) {
              this.selectedDepartmentIds.push(departmentId);
          }
      } else {
          this.selectedDepartmentIds = this.selectedDepartmentIds.filter(id => id !== departmentId);
      }
  }

  assignAssessment(){
    this.successMessage = ''; this.errorMessage='';
    this.submitted = true;
    console.log("AssessmentIds " + this.Assessments.length);
    const assessmentIds: number[] = this.Assessments.map(c => c.assessmentId);
    if (this.selectedDepartmentIds.length === 0) {
        this.errorMessage = 'Please select at least one assessment.';
        this.successMessage = '';
        this.submitted = true;
        return;
    }
    var param ={
      TenantId: this.TenantId,
      SelectedDepartmentIds: this.selectedDepartmentIds,
      SelectedAssessmentIds: assessmentIds
    }
   
    this.departmentService.assignAssessmentToDepartment(param).subscribe({
      next: (res:any) =>
      {
        if(res.success){
          this.successMessage = "Assessment assign successfully."
            setTimeout(() => {
               this.successMessage = ''; this.errorMessage='';
              this.submitted = false;
              this.cancel();
            }, 2000); // 2 seconds = 2000 milliseconds
        }
      },
      error: (err:any)=>  {
        this.errorMessage = 'Error occure while assigning assessment';
        console.error('Error while assign assessment:', err)
      }
    });
  }

  cancel(): void {
    this.close.emit();
  }

}
