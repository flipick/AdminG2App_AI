import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  result: T;
  message?: string;
}

export interface ILearningGoalMapping {
  id: number;
  courseId: number;
  careerPathIds: string[]; // Array of career path IDs
  targetRoleIds: string[]; // Array of target role IDs
  skillIds: string[];      // Array of skill IDs
  timeCommitment: 'low' | 'medium' | 'high';
  learningStyle: 'visual' | 'reading' | 'interactive';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

@Injectable({
  providedIn: 'root'
})
export class LearningGoalService {
  baseUrl = environment.apiUrl + '/api/LearningGoalMapping';

  constructor(private http: HttpClient) { }

  getLearningGoalMapping(courseId: number): Observable<ApiResponse<ILearningGoalMapping>> {
    return this.http.get<ApiResponse<ILearningGoalMapping>>(`${this.baseUrl}/${courseId}`);
  }

  saveLearningGoalMapping(mapping: ILearningGoalMapping): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.baseUrl, mapping);
  }

  // Get available career paths from the learning goals system
  getCareerPaths(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/api/LearningGoal/CareerPaths`);
  }

  // Get available target roles from the learning goals system
  getTargetRoles(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/api/LearningGoal/TargetRoles`);
  }

  // Get available skills from the learning goals system
  getSkills(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/api/LearningGoal/Skills`);
  }
}