export interface IRolePlayScenario {
    scenarioId: number;
    title: string;
    description: string;
    duration: number;
    roles: number;
    assessmentId: number;
    evaluationCriteria: IRolePlayEvaluationCriteria[];
    learningObjective: IRolePlayLearningObjective[];
    flag: number;
}

export interface IRolePlayEvaluationCriteria {
    criteriaId: number;
    scenarioId: number;
    criteria: string;
    points: number;
    isRemoved?: boolean;
}

export interface IRolePlayLearningObjective {
    objectiveId: number;
    scenarioId: number;
    objective: string;
    isRemoved?: boolean; 
}
