export interface IChat
{
    promptSend: string;
    promptReceived: string;
    questionMasterId:string;
    isAdmin:number;
    isFlag:number;
}
export interface IPrompt
{
    promptId: string;
    promptName: string;
    promptAliase: string;
    promptValue: string;
}

export interface ISkillEvaluationResponseModel {
  queryResult: string;
  conversationId: string;
  skillsEvaluationReport: ISkillsEvaluationReport;  
}

export interface ISkillsEvaluationReport {
  candidateOverview: ICandidateOverview;
  roleFitSummary: IRoleFitSummary;
  skillsGapsByFunction: ISkillsGapsByFunction;
}
export interface ICandidateOverview {
  name: string;
  sector: string;
  track: string;
  suggestedJobRole: string;
  roleReadinessScore: IRoleReadinessScore;
}

export interface IRoleReadinessScore {
  percentage: number;
  description: string;
}
export interface IRoleFitSummary {
  experienceMatch: string;
  skillMatch: string;
  gapsIdentified: string[];
}

export interface ISkillsGapsByFunction {
  criticalFunctions: ICriticalFunction[];
}

export interface ICriticalFunction {
  criticalFunctionTitle: string;
  keyGaps: string[];
}