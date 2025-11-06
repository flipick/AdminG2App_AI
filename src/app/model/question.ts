
export interface IQuestionType{
    questionTypeId: number;
    questionTypeName: string;
    description: string;
    status: string;
}

export interface IOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

export interface IQuestion {
  questionId: number;
  questionText: string;
  options: { optionText: string; isCorrect: boolean }[];
  isTrueFalse?: boolean;   
  isSelected: boolean
}

export interface IQuestionStatus{
  questionId: number;
  questionText: string;
  status: number; 
}

export interface IOpenAIQuestion
{
  questionId: number;
  questionText: string;
  isSelected: boolean;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: string;
  solution: string;
  bloomsTaxonomy: string;
  difficultyLevel: string;
}

export interface IAdaptiveAssessment {
  adaptiveAssessmentId: number;
  assessmentId?: number;
  difficultyLevel?: number;
  correctAnswerMarks?: number;
  incorrectAnswerMarks?: number;
  isSelected: boolean;
  flag: number;
  totalRowCount: number;
}

export interface IQuestions {
    questionId: number;
    questionTypeId: number;
    questionText: string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
    isCorrect: boolean;
    answer: string;
    solution: string;
    description: string;
    points: number;
    explanation: string;
    status: number;
    difficultyLevel: string;
    bloomsTaxonomy: string;
    flag: number;
    row: string;
    totalRowCount: string;
    questionBankId: number;
    isSelected: boolean;
}
