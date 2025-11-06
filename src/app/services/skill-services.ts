import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CoreSkillGap, IJobSector, KeyTask, TdcSkillGap } from '../model/skill';
import { environment } from '../../environments/environment';

const apiUrl = `${environment.apiUrl}`;

export interface ApiResponse<T> {
    isError: boolean;
    statusCode: number;
    result?: T;
    message?: string;
}

export interface SectorApiResult {
    data: IJobSector[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalRecordsText: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {

  constructor(private http: HttpClient) { }

  getSectorsTracksJobRoles(pageIndex: number = 0, pageSize: number = 0): Observable<ApiResponse<SectorApiResult>> {
    return this.http.get<ApiResponse<SectorApiResult>>(
      `${apiUrl}/Skill/GetSectorsTracksJobRoles`,
      { params: { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() } }
    );
  }

  getKeyTasks(payload: any): Observable<ApiResponse<KeyTask[]>> {
    return this.http.post<ApiResponse<KeyTask[]>>(apiUrl + "/Skill/GetKeyTaskByRoles", payload);
  }

  getSkillGapAnalysis(payload: any): Observable<{ coreSkills: CoreSkillGap[], tdcSkills: TdcSkillGap[] }> {
    return this.http.post<any>(`${apiUrl}/Skill/GetCoreSkillAndTDSkillByRoles`, payload).pipe(
      map((res: any) => {
        const allSkills: any[] = Array.isArray(res.result) ? res.result : [];
        const coreSkills: CoreSkillGap[] = allSkills.filter(s => s.coreSkill).map(s => ({
          coreSkill: s.coreSkill,
          proficiencyLevel: s.proficiencyLevel ?? null,
          isUsed: s.isUsed ?? 0
        }));
        const tdcSkills: TdcSkillGap[] = allSkills.filter(s => s.tdcSkill).map(s => ({
          tdcSkill: s.tdcSkill,
          tdcProficiencyLevel: s.tdcProficiencyLevel ?? null,
          tdcIsUsed: s.tdcIsUsed ?? 0
        }));
        return { coreSkills, tdcSkills };
      })
    );
  }

  assignRolesToTenant(payload: any): Observable<any> { return this.http.post<any>(apiUrl + "/Skill/RolesAssignToTenant", payload); }

  getTenantJobRoles(request: any): Observable<any> {
    let params = new HttpParams()
      .set('sector', request.sector)
      .set('track', request.track)
      .set('tenantId', request.tenantId);
    return this.http.get<any>(`${apiUrl}/Skill/GetTenantJobRoles`, { params });
  }

  updateSkills(payload: any): Observable<any> 
  { 
    return this.http.post(apiUrl + "/Skill/updateSkills", payload); 
  }

    // Add new sector / track / role
  addSectorTrackRole(payload: {
    tenantId: string,
    sectorName: string,
    trackName: string,
    roleName: string,
    jobRoleDescription: string,
    roleId:string
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${apiUrl}/Skill/AddSectorsTracksJobRoles`, payload);
  }

    addOrUpdateSectorTrackRole(payload: any) {
        return this.http.post<ApiResponse<any>>(`${apiUrl}/Skill/AddOrUpdate`, payload);
    }

 deleteSectorTrackRole(jobRoleId: number) {
    return this.http.post<ApiResponse<any>>(
        `${apiUrl}/Skill/DeleteRoleByJobRoleId`,
        jobRoleId // send as body
    );
}

}
