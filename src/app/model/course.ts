import { ITenant } from "./tenant";

export interface ICourse {
    courseId: number; 
    courseName: string;
    duration: string; 
    description: string;   
    categoryId: number;
    difficultyLevelId: number;
    courseType: string;
    courseTypeUrl: string;
    tags: string;    
    tenantScope: string;
    enrollmentId:number;
    status:string;
    isTrackLearnerProgess: boolean;
    isTrackTimeSpent:boolean;
    isTrackAssessmentScores: boolean;
    certificationSetting: string;
    courseTenants: ITenant[];  
    thumbnailUrl: string,
    isSelected?: boolean;
    thumbnailType: string;
    isPackage: boolean;
    isTableOfContent: boolean;
    curriculumSectionId: number;
    subscriptionMonth: number;
    registrationDate?: Date | null;
    expirationDate?: Date | null;
}
export interface CourseActivity {
  title: string;
  category: string;
  duration: string;
  status: 'PUBLISHED' | 'DRAFT';
  enrolled: number;
  completion: number;
}

export interface IPackageCourse {
    packagecourseid: number; 
    packageid: number; 
    courseid: number; 
    sequenceno: number; 
    courseId: number; 
    courseName: string;
    duration: string; 
    description: string;   
    categoryId: number;
    difficultyLevelId: number;
    courseType: string;
    courseTypeUrl: string;
    tags: string;    
    tenantScope: string;
    enrollmentId:number;
    status:string;
    isTrackLearnerProgess: boolean;
    isTrackTimeSpent:boolean;
    isTrackAssessmentScores: boolean;
    certificationSetting: string;
    courseTenants: ITenant[];  
    thumbnailUrl: string,
    isSelected?: boolean;
    thumbnailType: string;
    isPackage: boolean;
    isTableOfContent: boolean;
}
