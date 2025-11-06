import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

const apiUrl = `${environment.apiUrl}`; 
@Injectable({
  providedIn: 'root'
})
export class TalentEvaluationService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {}

// copyEmployeeSkills(employeeId: number): Observable<any> {
//   return this.http.post<any>(`${apiUrl}/TalentEvaluation/CopyTenantJobRoleToEmployee`, employeeId);
// }
 copyEmployeeSkills(employeeId: number): Observable<any> {
    const body = { employeeId };  // matches SkillGapByEmployeeRequest DTO
    return this.http.post<any>(`${apiUrl}/TalentEvaluation/CopyTenantJobRoleToEmployee`, body);
  }

getKeyTasksByEmployee(employeeId: number): Observable<any> {
  return this.http.post(`${apiUrl}/TalentEvaluation/GetKeyTasksByEmployee`, {
    employeeId: employeeId
  });
}

getSkillGapAnalysisByEmployee(employeeId: number): Observable<any> {
  return this.http.post(`${apiUrl}/TalentEvaluation/GetSkillGapAnalysisByEmployee`, {
    employeeId: employeeId
  });
}

UpdateEmployeeSkills(payload: any): Observable<any> {
    return this.http.post(`${apiUrl}/TalentEvaluation/UpdateEmployeeSkills`, payload);
}

deleteEmployeeKeyTaskByName(employeeId: number, keyTaskSkill: string): Observable<any> {
  return this.http.delete(`${apiUrl}/TalentEvaluation/DeleteEmployeeKeyTaskByName`, {
    params: { employeeId, keyTaskSkill }
  });
}
deleteEmployeeCoreSkillByName(employeeId: number, coreSkill: string): Observable<any> {
  return this.http.delete(`${apiUrl}/TalentEvaluation/DeleteEmployeeCoreSkillByName`, {
    params: { employeeId, coreSkill }
  });
}
  // ✅ Delete TDC Skill by Name
  deleteEmployeeTdcSkillByName(employeeId: number, tdcSkill: string): Observable<any> {
    return this.http.delete(`${apiUrl}/TalentEvaluation/DeleteEmployeeTDCSkillByName`, {
      params: { employeeId: employeeId.toString(), tdcSkill }
    });
  }
}