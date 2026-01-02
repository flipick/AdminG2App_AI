import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'SuperAdmin' | 'TenantAdmin' | 'DepartmentAdmin' | 'Instructor' | 'Learner';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject = new BehaviorSubject<UserRole>('Learner');
  public currentRole$: Observable<UserRole> = this.currentRoleSubject.asObservable();

  constructor() {
    this.loadRoleFromStorage();
  }

  private loadRoleFromStorage(): void {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      this.currentRoleSubject.next(storedRole);
    }
  }

  setRole(role: UserRole): void {
    localStorage.setItem('userRole', role);
    this.currentRoleSubject.next(role);
  }

  getCurrentRole(): UserRole {
    return this.currentRoleSubject.value;
  }

  hasPermission(allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(this.getCurrentRole());
  }

  clearRole(): void {
    localStorage.removeItem('userRole');
    this.currentRoleSubject.next('Learner');
  }
}