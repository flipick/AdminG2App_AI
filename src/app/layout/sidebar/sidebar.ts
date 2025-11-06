import { Component } from '@angular/core';
import { Router, RouterModule,RouterLinkActive } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,CommonModule, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  constructor(private router: Router) {}
  
  isCourseSectionActive(): boolean {
    return this.router.url.startsWith('/course-list') || this.router.url.startsWith('/course');
  }

  isEditSkillsSectionActive(): boolean {
    return this.router.url.startsWith('/add-edit-skills') || this.router.url.startsWith('/skills');
  }
  
  isAssessmentSectionActive(): boolean {
     return this.router.url.startsWith('/assessment-add-edit') || this.router.url.startsWith('/assessment-list');
  }

  isQuestionBankActive(): boolean {
     return this.router.url.startsWith('/question-bank-add-edit') || this.router.url.startsWith('/question-bank-list')
     || this.router.url.startsWith('/question-bank-list') || this.router.url.startsWith('/question-status-change');
  }
}
