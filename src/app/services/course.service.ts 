import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly API_URL = '/g2adminapi/api/Course';

  constructor(private http: HttpClient) {}

  getCourseById(courseId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/GetCourseById?CourseId=${courseId}`);
  }

  getAllCourses(filter?: any): Observable<any> {
    return this.http.post(`${this.API_URL}/GetAllCourses`, filter || {});
  }

  addUpdateCourse(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/AddUpdateCourse`, formData);
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/DeleteCourse?CourseId=${courseId}`);
  }

  uploadScorm(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/UploadScorm`, formData);
  }

  uploadPDF(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/UploadPDF`, formData);
  }

  updateCourseSetting(courseSetting: any): Observable<any> {
    return this.http.post(`${this.API_URL}/UpdateCourseSetting`, courseSetting);
  }

  assignCoursesToPackage(request: any): Observable<any> {
    return this.http.post(`${this.API_URL}/AssignCoursesToPackage`, request);
  }

  getCoursesByPackageId(packageId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/GetCoursesByPackageId?PackageId=${packageId}`);
  }

  getLearningPreferences(): Observable<any> {
    return this.http.get(`${this.API_URL}/GetLearningPreferences`);
  }

  saveLearningGoals(request: any): Observable<any> {
    return this.http.post(`${this.API_URL}/SaveLearningGoals`, request);
  }

  getLearningGoals(courseId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/GetLearningGoals/${courseId}`);
  }
}