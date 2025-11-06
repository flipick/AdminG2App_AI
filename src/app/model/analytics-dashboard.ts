export interface ITenantStat
{
    tenant_name: string;
    tenant_id: number;
    category_ids: string;
    category_names: string;
    total_departments: number;
    total_learners: number;
    overall_completion_rate: number;
    overall_avg_score: number;
}

export interface ITenantCategoryStat {
  tenant_name: string;
  tenant_id: number;
  category_id: string;
  category_name: string;
  total_departments: number;
  total_learners: number;
  category_completion_rate: number;
  category_avg_score: number;
}

export interface IDepartmentStat
{
    tenant_name: string;
    tenant_id: number;
    department_name: string;
    department_id: number;
    total_learners: number;
    avg_completion_rate: number;
    avg_score: number;
    total_learning_time: number;
    courses_offered: number;
    status: string;
}

export interface ILearnerStat
{
    tenant_name: string;
    tenant_id: number;
    department_name: string;
    department_id: number;
    learner_name: string;
    learner_id: number;
    email: string;
    total_courses: number;
    completed_courses: number;
    avg_score: number;
    total_time_minutes: number;
    last_login: string;
}