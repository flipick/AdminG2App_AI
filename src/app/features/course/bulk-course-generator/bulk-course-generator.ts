import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';

interface LearningPathData {
  role: string;
  learningPath: string;
  level: number;
  category: string;
  processed?: boolean;
}

interface GeneratedCourse {
  courseId?: number;
  courseName: string;
  duration: string;
  description: string;
  categoryId?: number;
  categoryName: string;
  difficultyLevelId: number;
  courseType: string;
  tags: string;
  thumbnailUrl?: string;
  status: string;
  isPackage: boolean;
  packageId?: number;
}

interface LearningPackage {
  courseId?: number;
  courseName: string;
  description: string;
  categoryName: string;
  thumbnailUrl?: string;
  status: string;
  isPackage: boolean;
  courses?: GeneratedCourse[];
}

@Component({
  selector: 'app-bulk-course-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-course-generator.html',
  styleUrls: ['./bulk-course-generator.css']
})
export class BulkCourseGenerator implements OnInit {
  private apiBaseUrl = '';  // Empty - full paths will be used
  
  dataSource: 'excel' | 'api' = 'excel';
  uploadedData: LearningPathData[] = [];
  isUploading = false;
  uploadError = '';
  isFetchingFromAPI = false;
  fetchError = '';
  
  selectedRole = '';
  selectedLearningPath = '';
  roles: string[] = [];
  learningPaths: string[] = [];
  filteredLearningPaths: string[] = [];
  
  isGenerating = false;
  generationProgress = '';
  generatedPackage: LearningPackage | null = null;
  
  allPackages: LearningPackage[] = [];
  isLoadingPackages = false;
  
  categories: any[] = [];
  difficultyLevels: any[] = [];
  
  viewMode: 'upload' | 'generate' | 'list' = 'upload';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('🚀 Component initialized');
    console.log('🔑 Access token exists?', !!localStorage.getItem('accessToken'));
    this.loadCategories();
    this.loadDifficultyLevels();
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      alert('Session expired. Please log in again.');
      return false;
    }

    try {
      const response: any = await this.http.post(
        `${environment.apiUrl}/Account/RefreshToken`,
        { refreshToken }
      ).toPromise();

      if (response.success && response.result) {
        localStorage.setItem('accessToken', response.result.accessToken);
        localStorage.setItem('refreshToken', response.result.refreshToken);
        console.log('✅ Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  loadCategories() {
    const url = `${environment.apiUrl}/Categories/GetCategories`;
    console.log('🔍 Loading categories from:', url);
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token length:', token?.length);
    
    const options = token 
      ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
    
    this.http.get(url, options).subscribe({
      next: (response: any) => {
        console.log('📦 Raw response:', response);
        console.log('📦 Response type:', typeof response);
        
        // Try different response structures
        if (response && response.success && response.result) {
          this.categories = Array.isArray(response.result) ? response.result : [];
          console.log(`✅ Loaded ${this.categories.length} categories`);
        } else if (Array.isArray(response)) {
          this.categories = response;
          console.log(`✅ Loaded ${this.categories.length} categories`);
        } else if (response && response.data) {
          this.categories = Array.isArray(response.data) ? response.data : [];
          console.log(`✅ Loaded ${this.categories.length} categories`);
        } else {
          console.warn('⚠️ Unexpected response structure:', response);
          this.categories = [];
        }
        
        if (this.categories.length === 0) {
          console.warn('⚠️ No categories found in response');
        }
      },
      error: async (error) => {
        console.error('❌ HTTP Error loading categories:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Status Text:', error.statusText);
        console.error('❌ Error object:', error);
        
        // Check if it's an auth error
        if (error.status === 401 || error.status === 0) {
          console.log('🔄 Attempting to refresh token...');
          const refreshed = await this.refreshAccessToken();
          
          if (refreshed) {
            console.log('✅ Token refreshed, retrying...');
            // Retry the request with new token
            this.loadCategories();
            return;
          }
        }
        
        if (error.status === 0) {
          alert('Network error: Cannot reach server. Check if backend is running.');
        } else if (error.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (error.status === 403) {
          alert('Access forbidden. Check permissions.');
        } else {
          alert(`Failed to load categories.\nStatus: ${error.status}\n\nPlease log in again or check console for details.`);
        }
      }
    });
  }

  loadDifficultyLevels() {
    const token = localStorage.getItem('accessToken');
    const options = token 
      ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
    
    this.http.get(`${environment.apiUrl}/DifficultyLevel/GetDifficultyLevels`, options).subscribe({
      next: (response: any) => {
        console.log('📦 Difficulty levels response:', response);
        
        if (response && response.success && response.result) {
          this.difficultyLevels = Array.isArray(response.result) ? response.result : [];
        } else if (Array.isArray(response)) {
          this.difficultyLevels = response;
        } else if (response && response.data) {
          this.difficultyLevels = Array.isArray(response.data) ? response.data : [];
        }
        
        console.log(`✅ Loaded ${this.difficultyLevels.length} difficulty levels`);
      },
      error: (error) => {
        console.error('Error loading difficulty levels:', error);
      }
    });
  }

  async fetchFromAPI() {
    this.isFetchingFromAPI = true;
    this.fetchError = '';
    
    try {
      const token = localStorage.getItem('accessToken');
      const options = token 
        ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
      
      const response: any = await this.http.get(
        `${environment.apiUrl}/Skill/GetSectorsTracksJobRolesByTenantAssign?pageIndex=0&pageSize=100`,
        options
      ).toPromise();

      console.log('API Response:', response);

      if (response.success && response.result?.data) {
        const sectors = response.result.data;
        const transformedData: LearningPathData[] = [];
        
        sectors.forEach((sector: any) => {
          sector.trackList?.forEach((track: any) => {
            track.jobRoleList?.forEach((role: any) => {
              transformedData.push({
                role: role.jobRoleName,
                learningPath: track.trackName,
                level: 2,
                category: sector.sectorName,
                processed: false
              });
            });
          });
        });

        this.uploadedData = transformedData;
        this.roles = [...new Set(transformedData.map(d => d.role))].sort();
        this.learningPaths = [...new Set(transformedData.map(d => d.learningPath))].sort();
        
        console.log('Transformed data:', this.uploadedData);
        this.viewMode = 'generate';
      }
    } catch (error: any) {
      console.error('Error fetching from API:', error);
      this.fetchError = `Failed to fetch data: ${error.message || 'Unknown error'}`;
    }
    
    this.isFetchingFromAPI = false;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.uploadError = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        this.uploadedData = jsonData.map((row: any) => ({
          role: row['Role']?.trim() || '',
          learningPath: row['Learning Path']?.trim() || '',
          level: parseInt(row['Level']) || 1,
          category: row['Category']?.trim() || '',
          processed: false
        })).filter(item => item.role && item.learningPath);

        this.roles = [...new Set(this.uploadedData.map(d => d.role))].sort();
        this.learningPaths = [...new Set(this.uploadedData.map(d => d.learningPath))].sort();

        console.log('Excel data loaded:', this.uploadedData);
        this.isUploading = false;
        this.viewMode = 'generate';
      } catch (error) {
        console.error('Excel parse error:', error);
        this.uploadError = 'Error parsing Excel file';
        this.isUploading = false;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  onRoleChange() {
    if (this.selectedRole) {
      this.filteredLearningPaths = this.uploadedData
        .filter(d => d.role === this.selectedRole)
        .map(d => d.learningPath);
      this.filteredLearningPaths = [...new Set(this.filteredLearningPaths)].sort();
    } else {
      this.filteredLearningPaths = [];
    }
    this.selectedLearningPath = '';
  }

  getSelectedLearningPathData(): LearningPathData | null {
    return this.uploadedData.find(
      d => d.role === this.selectedRole && d.learningPath === this.selectedLearningPath
    ) || null;
  }

  isLearningPathProcessed(): boolean {
    const data = this.getSelectedLearningPathData();
    return data?.processed || false;
  }

  async generateCourses() {
    if (!this.selectedRole || !this.selectedLearningPath) {
      alert('Please select both Role and Learning Path');
      return;
    }

    const learningPathData = this.getSelectedLearningPathData();
    if (!learningPathData) {
      alert('Could not find learning path data');
      return;
    }

    // Check if categories are loaded
    if (this.categories.length === 0) {
      alert('Categories not loaded yet. Please wait and try again.');
      return;
    }

    this.isGenerating = true;
    this.generationProgress = 'Starting generation...';

    try {
      console.log('Starting course generation for:', learningPathData);

      // Step 1: Generate metadata
      this.generationProgress = 'Generating course metadata...';
      const coursesMetadata = this.generateCourseMetadata(learningPathData);
      console.log('Generated metadata:', coursesMetadata);
      
      // Step 2: Create package
      this.generationProgress = 'Creating learning path package...';
      const packageData = await this.createPackage(learningPathData, coursesMetadata);
      console.log('Package created:', packageData);
      
      // Step 3: Create courses
      this.generationProgress = 'Creating courses...';
      const createdCourses = await this.createCourses(packageData.courseId!, coursesMetadata, learningPathData);
      console.log('Courses created:', createdCourses);
      
      // Step 4: Generate thumbnails (optional, can fail without breaking)
      this.generationProgress = 'Generating thumbnails...';
      try {
        await this.generateThumbnails(packageData, createdCourses);
      } catch (thumbError) {
        console.warn('Thumbnail generation failed (continuing anyway):', thumbError);
      }
      
      // Mark complete
      learningPathData.processed = true;
      this.generatedPackage = { ...packageData, courses: createdCourses };
      this.generationProgress = 'Complete!';
      
      alert('Successfully generated learning path with 4 courses!');
      
    } catch (error: any) {
      console.error('Generation error:', error);
      this.generationProgress = 'Error occurred!';
      
      let errorMessage = 'Error generating courses. ';
      if (error.status === 404) {
        errorMessage += 'API endpoint not found (404). Check API URL.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage += 'Authentication error. Please login again.';
      } else if (error.error?.message) {
        errorMessage += error.error.message;
      } else {
        errorMessage += error.message || 'Unknown error';
      }
      
      alert(errorMessage);
    } finally {
      this.isGenerating = false;
    }
  }

  private generateCourseMetadata(data: LearningPathData): any[] {
    const courses = [];
    const topics = ['Fundamentals', 'Intermediate', 'Advanced', 'Expert'];
    
    for (let i = 1; i <= 4; i++) {
      courses.push({
        courseName: `${data.learningPath} - Part ${i}: ${topics[i-1]}`,
        duration: `${2 + i}h`,
        description: `Part ${i} of ${data.learningPath} for ${data.role}s at Level ${data.level}. Covers ${topics[i-1]} level concepts.`,
        tags: `${data.learningPath}, ${data.role}, Level ${data.level}, Part ${i}`
      });
    }
    return courses;
  }

  private async createPackage(data: LearningPathData, coursesMetadata: any[]): Promise<any> {
    const categoryId = this.getCategoryIdByName(data.category);
    const totalDuration = coursesMetadata.reduce((sum, c) => sum + parseInt(c.duration), 0);
    
    const packageData = {
      courseId: 0,
      courseName: `${data.learningPath} Learning Path - ${data.role}`,
      duration: `${totalDuration}h`,
      description: `Complete ${data.learningPath} learning path for ${data.role}s at Level ${data.level}. Includes ${coursesMetadata.length} comprehensive courses.`,
      categoryId: categoryId,
      categoryName: data.category,
      difficultyLevelId: data.level,
      courseType: 'Package',
      tags: `${data.learningPath}, ${data.role}, Learning Path`,
      status: 'Draft',
      isPackage: true,
      tenantScope: 'Global',
      enrollmentId: 1,
      isTrackLearnerProgess: true,
      isTrackTimeSpent: true,
      isTrackAssessmentScores: false
    };

    const url = `${environment.apiUrl}/Course/AddUpdateCourse`;
    console.log('🔍 Creating package at URL:', url);
    console.log('📦 Package data:', packageData);

    const formData = new FormData();
    formData.append('CourseJson', JSON.stringify(packageData));

    const token = localStorage.getItem('accessToken');
    const options = token 
      ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };

    try {
      const response: any = await this.http.post(url, formData, options).toPromise();
      console.log('✅ Package created successfully:', response);

      if (response.success) {
        return { ...packageData, courseId: response.result };
      } else {
        throw new Error(response.message || 'Failed to create package');
      }
    } catch (error: any) {
      console.error('❌ Package creation failed:', error);
      console.error('❌ URL was:', url);
      console.error('❌ Status:', error.status);
      console.error('❌ Error message:', error.message);
      
      // Create helpful error message
      let errorMsg = `Failed to create package.\n\n`;
      errorMsg += `URL: ${url}\n`;
      errorMsg += `Status: ${error.status}\n`;
      
      if (error.status === 404) {
        errorMsg += `\n⚠️ 404 Not Found - The API endpoint doesn't exist.\n`;
        errorMsg += `This usually means:\n`;
        errorMsg += `1. Wrong base URL (currently: ${this.apiBaseUrl})\n`;
        errorMsg += `2. Backend API is not running\n`;
        errorMsg += `3. Proxy configuration issue\n\n`;
        errorMsg += `Try checking other working pages to find the correct API base URL.`;
      } else if (error.status === 0) {
        errorMsg += `\n⚠️ Network Error - Cannot reach server.\n`;
        errorMsg += `Check if your backend is running.`;
      }
      
      throw new Error(errorMsg);
    }
  }

  private async createCourses(packageId: number, coursesMetadata: any[], data: LearningPathData): Promise<GeneratedCourse[]> {
    const createdCourses: GeneratedCourse[] = [];
    const categoryId = this.getCategoryIdByName(data.category);

    for (let i = 0; i < coursesMetadata.length; i++) {
      const courseData = coursesMetadata[i];
      
      const course = {
        courseId: 0,
        courseName: courseData.courseName,
        duration: courseData.duration,
        description: courseData.description,
        categoryId: categoryId,
        categoryName: data.category,
        difficultyLevelId: data.level,
        courseType: 'Online',
        tags: courseData.tags,
        status: 'Draft',
        isPackage: false,
        packageId: packageId,
        tenantScope: 'Global',
        enrollmentId: 1,
        isTrackLearnerProgess: true,
        isTrackTimeSpent: true,
        isTrackAssessmentScores: false
      };

      console.log(`Creating course ${i+1}:`, course);

      const formData = new FormData();
      formData.append('CourseJson', JSON.stringify(course));
      
      const token = localStorage.getItem('accessToken');
      const options = token 
        ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
      
      try {
        const response: any = await this.http.post(
          `${environment.apiUrl}/Course/AddUpdateCourse`,
          formData,
          options
        ).toPromise();

        console.log(`Course ${i+1} response:`, response);

        if (response.success) {
          createdCourses.push({ ...course, courseId: response.result });
        } else {
          console.error(`Course ${i+1} creation failed:`, response);
        }
      } catch (error) {
        console.error(`Error creating course ${i+1}:`, error);
        throw error;
      }
    }

    return createdCourses;
  }

  private async generateThumbnails(packageData: any, courses: GeneratedCourse[]) {
    // This is optional - if it fails, we continue anyway
    for (const course of courses) {
      const token = localStorage.getItem('accessToken');
      const options = token 
        ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
      
      try {
        const response: any = await this.http.post(
          `${environment.apiUrl}/Freepik/GenerateImage`,
          { 
            prompt: `Educational course: ${course.courseName}`, 
            numImages: 1, 
            size: '16:9' 
          },
          options
        ).toPromise();
        
        if (response.success) {
          course.thumbnailUrl = response.result?.imagePath;
        }
      } catch (error) {
        console.warn('Thumbnail generation failed for:', course.courseName);
      }
    }
  }

  async loadExistingPackages() {
    this.isLoadingPackages = true;
    
    const token = localStorage.getItem('accessToken');
    const options = token 
      ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
      : { withCredentials: true };
    
    try {
      const response: any = await this.http.get(
        `${environment.apiUrl}/Course/GetCourses`,
        options
      ).toPromise();

      if (response.success) {
        this.allPackages = (response.result || [])
          .filter((c: any) => c.isPackage)
          .map((pkg: any) => ({ ...pkg, courses: [] }));
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    }
    
    this.isLoadingPackages = false;
  }

  async deletePackage(packageId: number) {
    if (confirm('Delete this learning path?')) {
      const token = localStorage.getItem('accessToken');
      const options = token 
        ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
      
      try {
        await this.http.get(`${environment.apiUrl}/Course/DeleteCourse?CourseId=${packageId}`, options).toPromise();
        await this.loadExistingPackages();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  }

  async deleteCourse(courseId: number) {
    if (confirm('Delete this course?')) {
      const token = localStorage.getItem('accessToken');
      const options = token 
        ? { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
      
      try {
        await this.http.get(`${environment.apiUrl}/Course/DeleteCourse?CourseId=${courseId}`, options).toPromise();
        await this.loadExistingPackages();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  }

  private getCategoryIdByName(categoryName: string): number {
    const category = this.categories.find(c => 
      c.categoryName.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (!category) {
      console.warn(`Category not found: ${categoryName}, using first available`);
      return this.categories[0]?.categoryId || 1;
    }
    
    return category.categoryId;
  }

  switchView(view: 'upload' | 'generate' | 'list') {
    this.viewMode = view;
    if (view === 'list') {
      this.loadExistingPackages();
    }
  }

  resetUpload() {
    this.uploadedData = [];
    this.selectedRole = '';
    this.selectedLearningPath = '';
    this.generatedPackage = null;
    this.viewMode = 'upload';
  }

  switchDataSource(source: 'excel' | 'api') {
    this.dataSource = source;
    this.uploadedData = [];
    this.uploadError = '';
    this.fetchError = '';
  }
}