import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DepartmentService } from '../../services/department-service';
import { IDepartment } from '../../model/department';
import { ICourse } from '../../model/course';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-assign-courses-to-department',
  imports: [CommonModule],
  templateUrl: './assign-courses-to-department.html',
  styleUrl: './assign-courses-to-department.css'
})
export class AssignCoursesToDepartment implements OnInit {
  @Input() Courses: ICourse[] = [];
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
    console.log('Received Courses:', this.Courses);
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
          // Add department ID if checked
          if (!this.selectedDepartmentIds.includes(departmentId)) {
              this.selectedDepartmentIds.push(departmentId);
          }
      } else {
          // Remove department ID if unchecked
          this.selectedDepartmentIds = this.selectedDepartmentIds.filter(id => id !== departmentId);
      }
  }

  assignCourse(){
    this.successMessage = ''; this.errorMessage='';
    this.submitted = true;
    console.log("CourseIds " + this.Courses.length);
    const courseIds: number[] = this.Courses.map(c => c.courseId);
    if (this.selectedDepartmentIds.length === 0) {
        this.errorMessage = 'Please select at least one department.';
        this.successMessage = '';
        this.submitted = true;
        return;
    }
    var param ={
      TenantId: this.TenantId,
      SelectedDepartmentIds: this.selectedDepartmentIds,
      SelectedCourseIds: courseIds
    }
   
    this.departmentService.assignCoursesToDepartment(param).subscribe({
      next: (res:any) =>
      {
        if(res.success){
          this.successMessage = "Course assign successfully."
            setTimeout(() => {
               this.successMessage = ''; this.errorMessage='';
              this.submitted = false;
              this.cancel();
            }, 2000); // 2 seconds = 2000 milliseconds
        }
      },
      error: (err:any)=>  {
        this.errorMessage = 'Error occure while assigning courses';
        console.error('Error while assign courses:', err)
      }
    });
  }

  cancel(): void {
    this.close.emit();
  }

}
