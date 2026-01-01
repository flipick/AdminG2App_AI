import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import { map, switchMap, tap, delay } from 'rxjs/operators';
import * as XLSX from 'xlsx';

export interface SkillBasedCourse {
  skillName: string;
  track: string;
  role: string;
  proficiencyLevel?: string;
  courseType?: string;
}

export interface CourseShell {
  courseId?: number;
  courseName: string;
  description: string;
  categoryId: number;
  difficultyLevelId: number;
  courseType: string;
  courseTypeUrl?: string;  // Make it optional
  tags: string;
  tenantScope: string;
  enrollmentId: number;
  status: string;
  isTrackLearnerProgess: boolean;
  isTrackTimeSpent: boolean;
  isTrackAssessmentScores: boolean;
  isPackage: boolean;
  isTableOfContent: boolean;
  certificationSetting: string;
  subscriptionMonth: number;
  skillName?: string;
  track?: string;
  role?: string;
}

export interface LearningPathShell {
  courseId?: number;
  courseName: string;
  description: string;
  categoryId: number;
  isPackage: boolean;
  courses: CourseShell[];
  role: string;
  track: string;
}

@Injectable({
  providedIn: 'root'
})
export class BulkCourseGeneratorService {
  private readonly COURSE_API = '/g2adminapi/api/Course';
  private readonly SKILL_API = '/g2adminapi/api/Skill';

  constructor(private http: HttpClient) {}

  getSkillsByRole(request: { aspiredRole: string; aspiredTrack: string }): Observable<any> {
    return this.http.post(`${this.SKILL_API}/GetCoreSkillAndTDSkillByRoles`, request);
  }

  parseExcelFile(file: File): Promise<SkillBasedCourse[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          const skills = this.mapExcelToSkills(jsonData);
          resolve(skills);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  private mapExcelToSkills(excelData: any[]): SkillBasedCourse[] {
    return excelData.map(row => ({
      skillName: row['Skill Name'] || row['skill'] || row['Skill'],
      track: row['Track'] || row['track'] || '',
      role: row['Role'] || row['role'] || row['Job Role'] || '',
      proficiencyLevel: row['Proficiency Level'] || row['Level'] || 'Intermediate',
      courseType: row['Course Type'] || 'Video'
    }));
  }

  generateCourseShells(
    skills: SkillBasedCourse[], 
    config: {
      categoryId: number;
      tenantScope: string;
      enrollmentId?: number;
    }
  ): CourseShell[] {
    return skills.map(skill => ({
      courseName: `${skill.skillName} - ${skill.role}`,
      description: `Course for ${skill.skillName} skill in ${skill.track} track for ${skill.role} role. Proficiency level: ${skill.proficiencyLevel || 'Intermediate'}`,
      categoryId: config.categoryId,
      difficultyLevelId: this.mapProficiencyToDifficulty(skill.proficiencyLevel),
      courseType: skill.courseType || 'Video',
      courseTypeUrl: '',
      tags: `${skill.track},${skill.role},${skill.skillName}`,
      tenantScope: config.tenantScope,
      enrollmentId: config.enrollmentId || 1,
      status: 'Draft',
      isTrackLearnerProgess: true,
      isTrackTimeSpent: true,
      isTrackAssessmentScores: true,
      isPackage: false,
      isTableOfContent: true,
      certificationSetting: 'OnCompletion',
      subscriptionMonth: 12,
      skillName: skill.skillName,
      track: skill.track,
      role: skill.role
    }));
  }

  private mapProficiencyToDifficulty(proficiency?: string): number {
    const level = (proficiency || '').toLowerCase();
    if (level.includes('beginner') || level.includes('basic')) return 1;
    if (level.includes('intermediate')) return 2;
    if (level.includes('advanced') || level.includes('expert')) return 3;
    return 2;
  }

  createCoursesInBulk(courseShells: CourseShell[]): Observable<any[]> {
    const createdCourses: any[] = [];
    
    const requests = courseShells.map((course, index) => 
      of(course).pipe(
        delay(index * 500),
        switchMap(courseData => this.createSingleCourse(courseData)),
        tap(result => {
          if (result.success) {
            createdCourses.push(result);
            console.log(`Created course: ${course.courseName}`);
          }
        })
      )
    );

    return concat(...requests).pipe(
      map(() => createdCourses)
    );
  }

  private createSingleCourse(course: CourseShell): Observable<any> {
    const formData = new FormData();
    
    formData.append('CourseJson', JSON.stringify({
      courseId: 0,
      courseName: course.courseName,
      duration: '0',
      description: course.description,
      categoryId: course.categoryId,
      difficultyLevelId: course.difficultyLevelId,
      courseType: course.courseType,
      courseTypeUrl: course.courseTypeUrl || '',
      tags: course.tags,
      tenantScope: course.tenantScope,
      enrollmentId: course.enrollmentId,
      status: course.status,
      isTrackLearnerProgess: course.isTrackLearnerProgess,
      isTrackTimeSpent: course.isTrackTimeSpent,
      isTrackAssessmentScores: course.isTrackAssessmentScores,
      isPackage: course.isPackage,
      isTableOfContent: course.isTableOfContent,
      certificationSetting: course.certificationSetting,
      subscriptionMonth: course.subscriptionMonth,
      flag: 1
    }));

    return this.http.post(`${this.COURSE_API}/AddUpdateCourse`, formData);
  }

  createLearningPathShell(
    pathName: string,
    description: string,
    categoryId: number,
    role: string,
    track: string
  ): Observable<any> {
    const formData = new FormData();
    
    formData.append('CourseJson', JSON.stringify({
      courseId: 0,
      courseName: pathName,
      duration: '0',
      description: description,
      categoryId: categoryId,
      difficultyLevelId: 2,
      courseType: 'Package',
      tags: `${track},${role},Learning Path`,
      tenantScope: 'All',
      enrollmentId: 1,
      status: 'Draft',
      isTrackLearnerProgess: true,
      isTrackTimeSpent: true,
      isTrackAssessmentScores: true,
      isPackage: true,
      isTableOfContent: true,
      certificationSetting: 'OnCompletion',
      subscriptionMonth: 12,
      flag: 1
    }));

    return this.http.post(`${this.COURSE_API}/AddUpdateCourse`, formData);
  }

  assignCoursesToLearningPath(packageId: number, courseIds: number[]): Observable<any> {
    const courses = courseIds.map(id => ({
      courseId: id,
      isSelected: true
    }));

    return this.http.post(`${this.COURSE_API}/AssignCoursesToPackage`, {
      packageId: packageId,
      courses: courses
    });
  }

  generateCompleteSkillBasedLearningPath(
    skills: SkillBasedCourse[],
    config: {
      categoryId: number;
      tenantScope: string;
      enrollmentId?: number;
      learningPathName?: string;
      role: string;
      track: string;
    }
  ): Observable<any> {
    console.log('Starting course generation for', skills.length, 'skills');

    const courseShells = this.generateCourseShells(skills, config);
    
    return this.createCoursesInBulk(courseShells).pipe(
      switchMap((createdCourses: any[]) => {
        console.log('Created', createdCourses.length, 'courses');
        
        const pathName = config.learningPathName || 
          `${config.role} - ${config.track} Learning Path`;
        const pathDescription = `Comprehensive learning path for ${config.role} in ${config.track} covering ${skills.length} skills`;
        
        return this.createLearningPathShell(
          pathName,
          pathDescription,
          config.categoryId,
          config.role,
          config.track
        ).pipe(
          switchMap((learningPath: any) => {
            console.log('Created learning path:', learningPath);
            
            const courseIds = createdCourses
              .filter(c => c.success && c.result)
              .map(c => c.result);
            
            if (courseIds.length === 0) {
              return of({
                success: false,
                message: 'No courses were created successfully'
              });
            }
            
            return this.assignCoursesToLearningPath(learningPath.result, courseIds).pipe(
              map(() => ({
                success: true,
                message: 'Learning path created successfully',
                learningPathId: learningPath.result,
                coursesCreated: courseIds.length,
                courseIds: courseIds
              }))
            );
          })
        );
      })
    );
  }
}