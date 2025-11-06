import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient, public router: Router) { }

  getCategories(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Categories/GetCategories");
  }

  getAllCategories(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Categories/GetAllCategories", data, { headers: this.headers });
  }

  // 🔹 Add or Update category
  addOrUpdateCategory(payload: any): Observable<any> {
    return this.http.post<any>(`${apiUrl}/Categories/AddUpdateCategory`, payload, { headers: this.headers });
  }

  // 🔹 Delete category using GET (temporary, matches your current API)
  deleteCategory(CategoryId: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/Categories/DeleteCategory`, {
      headers: this.headers,
      params: { CategoryId: CategoryId.toString() } // convert to string
    });
  }

  // (Optional) 🔹 Get category by Id (for editing)
  getCategoryById(categoryId: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/Categories/GetCategoryById`, {
      headers: this.headers,
      params: { categoryId }
    });
  }
}
