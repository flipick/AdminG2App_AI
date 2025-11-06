import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { ICourse } from '../model/course';

const apiUrl = `${environment.apiUrl}`; 
@Injectable({
  providedIn: 'root'
})
export class CourseService {  
  
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getCourses() {
    return this.http.get(`${apiUrl}/Course/GetCourses`, { headers: this.headers });
  }

  getCourseById(id: number) {
    return this.http.get(`${apiUrl}/Course/GetCourseById?CourseId=${id}`, { headers: this.headers });
  }

  getAllCourses(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Course/GetAllCourses`, data, { headers: this.headers });
  }

  addUpdateCourse(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Course/AddUpdateCourse`, data);
  }
  
  updateCourse(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Course/UpdateCourse`, data, { headers: this.headers });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.get(`${apiUrl}/Course/DeleteCourse?CourseId=${id}`, { headers: this.headers });
  }
  uploadScorm(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Course/UploadScorm', data);
  }
  uploadPdf(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Course/UploadPdf', data);
  }
  saveCourseUrl(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Course/UpdateCourseUrl', data);
  }

  updateCourseSetting(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Course/UpdateCourseSetting`, data, { headers: this.headers });
  }

  generateAIThumbnailImage(request: any): Observable<any> {
    return this.http.post(`${apiUrl}/Freepik/GenerateImage`, request);
  }

  generateMysticImageAsync(request: any): Observable<any> {
    return this.http.post(`${apiUrl}/Freepik/GenerateMysticImageAsync`, request);
  }

  getCoursesByPackageId(id: number): Observable<any> {
    return this.http.get(`${apiUrl}/Course/GetCoursesByPackageId?PackageId=${id}`, { headers: this.headers });
  }

  assignCoursesToPackage(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Course/AssignCoursesToPackage`, data);
  }

  getCourse(id: number): Observable<ICourse> {
    if (id == 0) {
      return of(this.initializedClient()); // Return an empty course object if id is 0
    }
    else 
    {
      return this.http
        .get<ICourse>(apiUrl + '/Course/GetCourseById?CourseId=' + id, {
          headers: this.headers,
        })
        .pipe(
          map((response: any) => {
            return response.result;
          }),
          catchError((err: any, caught: any) => {
            console.error(err);
            throw err;
          })
        );
    }
  }

  assignTenantsToCourses(payload: any): Observable<any> {
    return this.http.post<any>(`${apiUrl}/Course/AssignTenantsToCourses`, payload);
  }
  
  private initializedClient(): ICourse {
    return {
      courseId: 0,
      courseName: '',
      duration: '',
      description: '',
      categoryId: 0,
      difficultyLevelId: 0,
      courseType: '',
      courseTypeUrl:'',
      tags: '',
      tenantScope:'',
      enrollmentId: 0,
      status:'',
      isTrackLearnerProgess: false,
      isTrackTimeSpent: false,
      isTrackAssessmentScores: false,
      certificationSetting: '',
      courseTenants: [],
      thumbnailUrl:'',
      thumbnailType:'',
      isPackage: false,
      isTableOfContent: false,
      curriculumSectionId:0,
      subscriptionMonth: 0
    };
  }
}
