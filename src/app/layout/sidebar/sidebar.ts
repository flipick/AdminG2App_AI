import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
  isActive?: () => boolean;
  exactMatch?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  currentUserRole: string = '';
  visibleNavigationItems: NavigationItem[] = [];

  private readonly allNavigationItems: NavigationItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin', 'Instructor', 'Learner'],
      exactMatch: true
    },
    {
      path: '/course-list',
      label: 'Course Management',
      icon: '📚',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin', 'Instructor'],
      isActive: () => this.isCourseSectionActive()
    },
    {
      path: '/bulk-course-generator',
      label: 'Bulk Course Generator',
      icon: '⚡',
      roles: ['SuperAdmin', 'TenantAdmin']
    },
    {
      path: '/assessment-list',
      label: 'Assessment Management',
      icon: '📝',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin', 'Instructor'],
      isActive: () => this.isAssessmentSectionActive()
    },
    {
      path: '/skills',
      label: 'Skills Framework',
      icon: '🎯',
      roles: ['SuperAdmin', 'TenantAdmin'],
      isActive: () => this.isEditSkillsSectionActive()
    },
    {
      path: '/employee-list',
      label: 'Employee Management',
      icon: '👥',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin']
    },
    {
      path: '/evaluation',
      label: 'Talent Evaluation',
      icon: '⭐',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin', 'Instructor']
    },
    {
      path: '/ai-assistant',
      label: 'AI Assistant',
      icon: '🤖',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin', 'Instructor', 'Learner']
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📈',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin']
    },
    {
      path: '/tenants',
      label: 'Tenants',
      icon: '🏢',
      roles: ['SuperAdmin']
    },
    {
      path: '/question-bank-list',
      label: 'Question Bank',
      icon: '❓',
      roles: ['SuperAdmin', 'TenantAdmin', 'DepartmentAdmin', 'Instructor'],
      isActive: () => this.isQuestionBankActive()
    },
    {
      path: '/department',
      label: 'Department',
      icon: '🗂️',
      roles: ['SuperAdmin', 'TenantAdmin']
    },
    {
      path: '/category',
      label: 'Category',
      icon: '🏷️',
      roles: ['SuperAdmin', 'TenantAdmin']
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserRole();
    this.filterNavigationByRole();
  }

  private loadUserRole(): void {
    const storedRole = localStorage.getItem('userRole');
    this.currentUserRole = storedRole || 'SuperAdmin';
  }

  private filterNavigationByRole(): void {
    this.visibleNavigationItems = this.allNavigationItems.filter(item =>
      item.roles.includes(this.currentUserRole)
    );
  }

  isItemActive(item: NavigationItem): boolean {
    if (item.isActive) {
      return item.isActive();
    }
    
    if (item.exactMatch) {
      return this.router.url === item.path;
    }
    
    return this.router.url.startsWith(item.path);
  }
  
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
    return this.router.url.startsWith('/question-bank-add-edit') || 
           this.router.url.startsWith('/question-bank-list') || 
           this.router.url.startsWith('/question-status-change');
  }

  public refreshNavigation(): void {
    this.loadUserRole();
    this.filterNavigationByRole();
  }
}