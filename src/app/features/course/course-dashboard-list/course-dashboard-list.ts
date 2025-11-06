import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FilterDetails } from '../../../model/table';
import { CourseService } from '../../../services/course-service';

@Component({
  selector: 'app-course-dashboard-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-dashboard-list.html',
  styleUrls: ['./course-dashboard-list.css']
})
export class CourseDashboardList {
  @Input() tenantId: string = '';
  @Input() roleName: string = '';

  payload = { pageIndex: 0, pageSize: 5, filter: [] as FilterDetails[] };
  selectedTenantId: string = '';
  courses: any[] = [];
  filteredCourses: any[] = [];
  loading: boolean = false;

  // pagination
  pageIndex: number = 0;
  pageSize: number = 5;
  totalItems: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;

  // search & sort
  searchText: string = '';
  sortColumn: string = 'courseName';
  sortDirection: 'asc' | 'desc' = 'asc';


  constructor(private courseService: CourseService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.selectedTenantId = this.tenantId;
    this.bindCourseList();
  }
  

  bindCourseList() {
    const index = this.payload.filter.findIndex(
      (obj: FilterDetails) => obj.colId?.toLowerCase() === 'tenantid'
    );

    if (index > -1) {
      this.payload.filter[index].value = this.selectedTenantId;
    }

    if (this.payload.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = 'tenantid';
      objFilter.name = 'tenantid';
      objFilter.value = this.selectedTenantId;
      objFilter.type = 'cs';
      this.payload.filter.push(objFilter);
    }

    this.loadCourses(this.payload);
  }

  loadCourses(payload: any) {
    this.courseService.getAllCourses(payload).subscribe((response: any) => {
      if (response.success && response.result?.data) {
        this.courses = response.result.data;
        this.totalItems = response.result.totalItems;
        this.applyPagination();
        this.loading = true;
      }
    });
  }

  // Search
  onSearch() {
    this.pageIndex = 0;
    this.applyPagination();
  }

  // Sorting function
  sortTable(column: string) {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc'; // default first click ascending
    }

    this.courses.sort((a: any, b: any) => {
      const valA = a[column] ?? '';
      const valB = b[column] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return this.sortDirection === 'asc'
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

    this.pageIndex = 0;
    this.applyPagination();
  }

  // Function to show the sorting arrow
  getSortArrow(column: string): SafeHtml {
    const upArrow = `
      <svg class="w-4 h-4 fill-gray-800" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"  class="bi bi-arrow-up">
        <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
      </svg>
    `;

    const downArrow = `
      <svg class="w-4 h-4 fill-gray-800" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"  class="bi bi-arrow-down">
        <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
      </svg>
    `;

    const svg = this.sortColumn === column
      ? (this.sortDirection === 'asc' ? upArrow : downArrow)
      : upArrow;

    // ✅ Sanitize before returning
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }



  // Pagination & search remain same as previous fix
  applyPagination() {
    this.startIndex = this.pageIndex * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.totalItems);

    const sourceArray = this.searchText.trim()
      ? this.courses.filter(course =>
        course.courseName.toLowerCase().includes(this.searchText.toLowerCase())
      )
      : this.courses;

    this.totalItems = sourceArray.length;
    this.filteredCourses = sourceArray.slice(this.startIndex, this.endIndex);
  }

  nextPage() {
    if ((this.pageIndex + 1) * this.pageSize < this.totalItems) {
      this.pageIndex++;
      this.applyPagination();
    }
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.applyPagination();
    }
  }
}
