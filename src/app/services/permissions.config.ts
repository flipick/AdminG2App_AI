import { Dashboard } from "../features/dashboard/dashboard";
import { IPermission, IRole } from "../model/permission";


export const IPERMISSIONS: Record<IRole, Record<string, IPermission>> = {
  superadmin: {
    CourseManagement: {
      showAddCourseButton:true,
      showTenantScope: false,
      showTenantDropdown: true,
      getDataBasedOnTenant: true,
    },
    AssessmentManagement: {
      showAddAssessmentButton:true,
      showTenantScope: false,
      showTenantDropdown: true,
      getDataBasedOnTenant: true,
    },
    SkillFramework: {
      showTenantDropdown: true,
      getDataBasedOnTenant: true,
      showSectorDropdown: true,
      showTrackDropdown: true,
      showAssignToTenantButton: true,
      showSkillSettings:true,
    },
    EmployeeManagement: {
      showTenantDropdown: true,
      getDataBasedOnTenant: true,
    },
    AIAssistance: {
      showTenantDropdown: true,
      getDataBasedOnTenant: true,
    },
    TenantManagement: {
      showTenantDropdown: true,
      getDataBasedOnTenant: true,
      canAddTenant: true,
      canEditTenant: true,
      canManageTenant: true,
    },
    DashboardManagement: {
      showSuperUserSectionData:true,
      showAdminUserSectionData:false,
    },
    QuestionBankManagement:{
      showCreateNewQuestionBankButton: true,
    },
    AnalyticsManagement: {
      showTenantDropdown: true
    }
  },

  admin: {
    CourseManagement: {
      showAddCourseButton:true,
      showTenantDropdown: false,
      showTenantScope: false,
      getDataBasedOnTenant: true,
    },
    AssessmentManagement: {
      showAddAssessmentButton:true,
      showTenantDropdown: false,
      showTenantScope: false,
      getDataBasedOnTenant: true,
    },
    SkillFramework: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
      showSectorDropdown: true,
      showTrackDropdown: true,
      showAssignToTenantButton: true,
      showSkillSettings:false,
    },
    EmployeeManagement: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
    },
    AIAssistance: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
    },
    TenantManagement: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
      canAddTenant: false,
      canEditTenant: false,
      canManageTenant: false,
    },
    DashboardManagement:{
      showSuperUserSectionData:false,
       showAdminUserSectionData:true,
    },
    QuestionBankManagement:{
      showCreateNewQuestionBankButton: true,
    },
    AnalyticsManagement: {
      showTenantDropdown: false
    }
  },

  instructor: {
    CourseManagement: {
      showAddCourseButton:true,
      showTenantDropdown: false,
      showTenantScope: false,
      getDataBasedOnTenant: true,
    },
    AssessmentManagement: {
      showAddAssessmentButton:true,
      showTenantDropdown: false,
      showTenantScope: false,
      getDataBasedOnTenant: true,
    },
    SkillFramework: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
      showSectorDropdown: true,
      showTrackDropdown: true,
      showAssignToTenantButton: true,
      showSkillSettings:false,
    },
    EmployeeManagement: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
    },
    AIAssistance: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
    },
    TenantManagement: {
      showTenantDropdown: false,
      getDataBasedOnTenant: true,
      canAddTenant: false,
      canEditTenant: false,
      canManageTenant: false,
    },
    DashboardManagement:{
      showSuperUserSectionData:false,
      showAdminUserSectionData:true,
    },
    QuestionBankManagement:{
      showCreateNewQuestionBankButton: true,
    },
    AnalyticsManagement: {
      showTenantDropdown: false
    }
  },
};
