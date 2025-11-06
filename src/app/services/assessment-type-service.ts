import { Injectable } from '@angular/core';
import { IAssessmentType } from '../model/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentTypeService {
  private storageKey = 'assessmentTypes';

  constructor() { }

  // Get all assessment types from localStorage
  getAll(): IAssessmentType[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Save the full array back to localStorage
  saveAll(assessmentTypes: IAssessmentType[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(assessmentTypes));
  }

  // Add a new assessment type
  add(assessmentType: IAssessmentType): void {
    const types = this.getAll();
    types.push(assessmentType);
    this.saveAll(types);
  }

  // Remove by assessmentTypeId
  removeById(id: number): void {
    const types = this.getAll().filter(t => t.assessmentTypeId !== id);
    this.saveAll(types);
  }

  // Remove by typeName
  removeByTypeName(typeName: string): void {
    const types = this.getAll().filter(t => t.typeName !== typeName);
    this.saveAll(types);
  }

  // Retrieve by assessmentTypeId
  getById(id: number): IAssessmentType | undefined {
    return this.getAll().find(t => t.assessmentTypeId === id);
  }

  // Retrieve by typeName
  getByTypeName(typeName: string): IAssessmentType | undefined {
    return this.getAll().find(t => t.typeName === typeName);
  }

  // Clear all data (optional utility)
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }
  
  existsByIdAndTypeName(id: number, typeName: string): boolean {
    return this.getAll().some(t => t.assessmentTypeId === id && t.typeName === typeName);
  }
}
