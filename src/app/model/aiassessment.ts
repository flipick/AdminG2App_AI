
export interface IAssessmentAgentResponse
{ 
    agentId: string;
    tagId: string;
}

export interface IAssessmentQuestionResponse
{
    questions: string[];
}

export interface IAIQuestion {
  aiQuestionid: number;
  assessmentId: number;
  noOfQuestions: number;
  question: string;
  assessmentTitle: string;
}