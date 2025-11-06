export type IRole = 'superadmin' | 'admin' | 'instructor';

export interface IPermission {
  showTenantDropdown?: boolean;
  showTenantScope?: boolean;
  showAddCourseButton?: boolean,
  showAddAssessmentButton?: boolean;
  getDataBasedOnTenant?: boolean;
  showSectorDropdown?: boolean;
  showTrackDropdown?: boolean;
  showAssignToTenantButton?: boolean;
  canAddTenant?: boolean;
  canEditTenant?: boolean;
  canManageTenant?: boolean;
  showSuperUserSectionData?: boolean;
  showAdminUserSectionData?: boolean;
  showCreateNewQuestionBankButton?: boolean;
  showSkillSettings?:boolean;
}
