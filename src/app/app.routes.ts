import { Routes } from '@angular/router';
import { Main } from './layout/main/main';
import { AuthGuard } from './features/interceptors/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '', redirectTo: 'login', pathMatch: 'full',
  },
  {
    path: '',
    component: Main,
    canActivate: [AuthGuard], 
    children: [
        {
          path: 'dashboard',
          loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        },
        {
          path: 'course/:id',
          loadComponent: () => import('./features/course/course-add-edit/course-add-edit').then((m) => m.CourseAddEdit),
        },
        {
          path: 'course-list',
          loadComponent: () => import('./features/course/course-list/course-list').then((m) => m.CourseList),
        },
        // {
        //   path: 'course',
        //   loadComponent: () => import('./features/course/course').then((m) => m.Course),
        // },
        {
          path: 'assessment-add-edit/:id',
          loadComponent: () => import('./features/assessment/assessment-add-edit/assessment-add-edit').then((m) => m.AssessmentAddEdit)
        },
        {
          path: 'assessment-list',
          loadComponent: () => import('./features/assessment/assessment-list/assessment-list').then((m) => m.AssessmentList),
        },
        {
          path: 'skills',
          loadComponent: () => import('./features/skills/skills').then((m) => m.Skills),
        },
        {
          path: 'add-edit-skills',
          loadComponent: () => import('./features/skills/add-edit-skills/add-edit-skills').then((m) => m.AddEditSkills),
        },
        {
          path: 'employee-list',
          loadComponent: () => import('./features/learner/employee-list').then((m) => m.EmployeeList),
        },
        {
          path: 'evaluation',
          loadComponent: () => import('./features/talent-evaluation/talent-evaluation').then((m) => m.TalentEvaluation),
        },
        {
          path: 'ai-assistant',
          loadComponent: () => import('./features/ai-assistant/ai-assistant').then((m) => m.AiAssistant),
        },
        {
          path: 'lms-integration',
          loadComponent: () => import('./features/lms-integration/lms-integration').then((m) => m.LmsIntegration),
        },
        {
          path: 'analytics',
          loadComponent: () => import('./features/analytics/analytic-details/analytic-details').then((m) => m.AnalyticDetails),
        },
        {
          path: 'tenants',
          loadComponent: () => import('./features/tenants/tenants').then((m) => m.Tenants),
        },
        {
          path: 'department',
          loadComponent: () => import('./features/department/department').then((m) => m.Department),
        },
        {
          path: 'category',
          loadComponent: () => import('./features/category/category').then((m) => m.Category),
        },
        {
          path: 'question-bank-list',
          loadComponent: () => import('./features/question-bank/question-bank-list/question-bank-list').then((m)=> m.QuestionBankList)
        },
        {
          path: 'question-bank-add-edit/:id',
          loadComponent: () => import('./features/question-bank/question-bank-add-edit/question-bank-add-edit').then((m)=> m.QuestionBankAddEdit)
        },
        {
          path: 'question-status-change/:id',
          loadComponent: () => import('./features/question-bank/question-bank-question-status-change/question-bank-question-status-change').then((m)=> m.QuestionBankQuestionStatusChange)
        }
    ]
  },
  {
    path: '**',redirectTo: 'login',
  },
];