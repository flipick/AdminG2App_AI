import { ITenant } from "./tenant";

export interface IAssessmentType{
    assessmentTypeId: number;
    typeName: string;
    description: string;
    status: string;
}

export interface IAssessment {
    assessmentId: number;
    assessmentTitle: string;
    assessmentType: string;
    assessmentTypeId: number; 
    description: string;
    tenantScope: string;
    assessmentTenants: ITenant[]; 
    timeLimitInMinutes: number;
    attemptsAllowed: number;
    passingScore: number;
    noOfQuestions: number;
    status: string;
    questions?: any[];
    questionOption?: string;
    questionOptionForId: number;
    isSelected: boolean;
    categoryId: number;
    subscriptionMonth: number;
    registrationDate?: Date | null;
    expirationDate?: Date | null;
    questionSelectionType: string;
}