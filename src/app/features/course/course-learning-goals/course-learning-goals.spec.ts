import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ILearningGoalMapping, LearningGoalService } from '../../../services/learning-goal-service';

interface CareerPath {
  id: string;
  name: string;
  isSelected: boolean;
}

interface TargetRole {
  id: string;
  name: string;
  isSelected: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  iconColor: string;
  isSelected?: boolean;
}

@Component({
  selector: 'app-course-learning-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-learning-goals.html',
  styleUrls: ['./course-learning-goals.css']
})
export class CourseLearningGoals implements OnInit {
  @Input() courseId: number = 0;
  @Output() onPrevious = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();
  
  // Form data
  learningGoalMapping: ILearningGoalMapping = {
    id: 0,
    courseId: 0,
    careerPathIds: [],
    targetRoleIds: [],
    skillIds: [],
    timeCommitment: 'medium',
    learningStyle: 'visual',
    difficultyLevel: 'beginner'
  };
  
  // UI state
  submitted: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  skillSearch: string = '';
  
  // Data lists
  careerPaths: CareerPath[] = [];
  targetRoles: TargetRole[] = [];
  allSkills: Skill[] = [];
  filteredSkills: Skill[] = [];
  selectedSkills: Skill[] = [];
  
  constructor(private learningGoalService: LearningGoalService) { }
  
  ngOnInit(): void {
    this.loadCareerPaths();
    this.loadTargetRoles();
    this.loadSkills();
    
    // If courseId exists, load existing mapping
    if (this.courseId > 0) {
      this.loadExistingMapping();
    }
  }
  
  loadExistingMapping(): void {
    this.learningGoalService.getLearningGoalMapping(this.courseId).subscribe({
      next: (response: any) => {
        if (response.success && response.result) {
          this.learningGoalMapping = response.result;
          
          // Update selected career paths
          if (this.learningGoalMapping.careerPathIds && this.learningGoalMapping.careerPathIds.length > 0) {
            const pathIds = this.learningGoalMapping.careerPathIds;
            this.careerPaths.forEach(path => {
              path.isSelected = pathIds.includes(path.id);
            });
          }
          
          // Update selected target roles
          if (this.learningGoalMapping.targetRoleIds && this.learningGoalMapping.targetRoleIds.length > 0) {
            const roleIds = this.learningGoalMapping.targetRoleIds;
            this.targetRoles.forEach(role => {
              role.isSelected = roleIds.includes(role.id);
            });
          }
          
          // Update selected skills
          if (this.learningGoalMapping.skillIds && this.learningGoalMapping.skillIds.length > 0) {
            const skillIds = this.learningGoalMapping.skillIds;
            this.selectedSkills = this.allSkills.filter(skill => 
              skillIds.includes(skill.id)
            );
          }
        }
      },
      error: (error: Error) => {
        console.error('Error loading learning goal mapping', error);
        this.errorMessage = 'Failed to load learning goal mapping';
      }
    });
  }
  
  loadCareerPaths(): void {
    this.learningGoalService.getCareerPaths().subscribe({
      next: (response: any) => {
        if (response.success && response.result) {
          this.careerPaths = response.result.map((path: any) => ({
            ...path,
            isSelected: false
          }));
        }
      },
      error: (error: Error) => {
        console.error('Error loading career paths', error);
        
        // If API fails, use mock data
        this.careerPaths = [
          { id: 'software-dev', name: 'Software Development', isSelected: false },
          { id: 'data-science', name: 'Data Science & Analytics', isSelected: false },
          { id: 'cloud-computing', name: 'Cloud Computing', isSelected: false },
          { id: 'cybersecurity', name: 'Cybersecurity', isSelected: false },
          { id: 'product-management', name: 'Product Management', isSelected: false },
          { id: 'ux-design', name: 'UX/UI Design', isSelected: false }
        ];
      }
    });
  }
  
  loadTargetRoles(): void {
    this.learningGoalService.getTargetRoles().subscribe({
      next: (response: any) => {
        if (response.success && response.result) {
          this.targetRoles = response.result.map((role: any) => ({
            ...role,
            isSelected: false
          }));
        }
      },
      error: (error: Error) => {
        console.error('Error loading target roles', error);
        
        // If API fails, use mock data
        this.targetRoles = [
          { id: 'frontend-dev', name: 'Frontend Developer', isSelected: false },
          { id: 'backend-dev', name: 'Backend Developer', isSelected: false },
          { id: 'fullstack-dev', name: 'Full Stack Developer', isSelected: false },
          { id: 'data-analyst', name: 'Data Analyst', isSelected: false },
          { id: 'data-scientist', name: 'Data Scientist', isSelected: false },
          { id: 'ml-engineer', name: 'Machine Learning Engineer', isSelected: false },
          { id: 'cloud-architect', name: 'Cloud Architect', isSelected: false },
          { id: 'devops-engineer', name: 'DevOps Engineer', isSelected: false },
          { id: 'security-analyst', name: 'Security Analyst', isSelected: false },
          { id: 'product-manager', name: 'Product Manager', isSelected: false },
          { id: 'ux-designer', name: 'UX Designer', isSelected: false },
          { id: 'ui-designer', name: 'UI Designer', isSelected: false }
        ];
      }
    });
  }
  
  loadSkills(): void {
    this.learningGoalService.getSkills().subscribe({
      next: (response: any) => {
        if (response.success && response.result) {
          this.allSkills = response.result;
          this.filteredSkills = [...this.allSkills];
        }
      },
      error: (error: Error) => {
        console.error('Error loading skills', error);
        
        // If API fails, use mock data
        this.allSkills = [
          // Technical skills
          { id: 'javascript', name: 'JavaScript', category: 'technical', iconColor: '#F7DF1E' },
          { id: 'python', name: 'Python', category: 'technical', iconColor: '#3776AB' },
          { id: 'java', name: 'Java', category: 'technical', iconColor: '#007396' },
          { id: 'csharp', name: 'C#', category: 'technical', iconColor: '#239120' },
          { id: 'react', name: 'React', category: 'technical', iconColor: '#61DAFB' },
          { id: 'angular', name: 'Angular', category: 'technical', iconColor: '#DD0031' },
          { id: 'vue', name: 'Vue.js', category: 'technical', iconColor: '#4FC08D' },
          { id: 'node', name: 'Node.js', category: 'technical', iconColor: '#339933' },
          { id: 'aws', name: 'AWS', category: 'technical', iconColor: '#FF9900' },
          { id: 'azure', name: 'Azure', category: 'technical', iconColor: '#0078D4' },
          { id: 'sql', name: 'SQL', category: 'technical', iconColor: '#4479A1' },
          { id: 'nosql', name: 'NoSQL', category: 'technical', iconColor: '#4DB33D' },
          { id: 'docker', name: 'Docker', category: 'technical', iconColor: '#2496ED' },
          { id: 'kubernetes', name: 'Kubernetes', category: 'technical', iconColor: '#326CE5' },
          
          // Soft skills
          { id: 'communication', name: 'Communication', category: 'soft', iconColor: '#10B981' },
          { id: 'teamwork', name: 'Teamwork', category: 'soft', iconColor: '#10B981' },
          { id: 'problem-solving', name: 'Problem Solving', category: 'soft', iconColor: '#10B981' },
          { id: 'critical-thinking', name: 'Critical Thinking', category: 'soft', iconColor: '#10B981' },
          { id: 'time-management', name: 'Time Management', category: 'soft', iconColor: '#10B981' },
          { id: 'leadership', name: 'Leadership', category: 'soft', iconColor: '#10B981' },
          
          // Domain skills
          { id: 'finance', name: 'Finance', category: 'domain', iconColor: '#6366F1' },
          { id: 'healthcare', name: 'Healthcare', category: 'domain', iconColor: '#6366F1' },
          { id: 'ecommerce', name: 'E-commerce', category: 'domain', iconColor: '#6366F1' },
          { id: 'edtech', name: 'EdTech', category: 'domain', iconColor: '#6366F1' },
          { id: 'gaming', name: 'Gaming', category: 'domain', iconColor: '#6366F1' }
        ];
        
        this.filteredSkills = [...this.allSkills];
      }
    });
  }
  
  /**
   * Filter skills based on search input
   */
  filterSkills(): void {
    if (!this.skillSearch.trim()) {
      this.filteredSkills = [...this.allSkills];
      return;
    }

    const searchLower = this.skillSearch.toLowerCase();
    this.filteredSkills = this.allSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Check if a skill is currently selected
   */
  isSkillSelected(skillId: string): boolean {
    return this.selectedSkills.some(skill => skill.id === skillId);
  }

  /**
   * Toggle skill selection
   */
  toggleSkill(skill: Skill): void {
    if (this.isSkillSelected(skill.id)) {
      this.removeSkill(skill);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  /**
   * Remove a skill from the selected list
   */
  removeSkill(skill: Skill): void {
    this.selectedSkills = this.selectedSkills.filter(s => s.id !== skill.id);
  }
  
  saveLearningGoalMapping(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Collect selected career paths
    this.learningGoalMapping.careerPathIds = this.careerPaths
      .filter(path => path.isSelected)
      .map(path => path.id);
    
    // Collect selected target roles
    this.learningGoalMapping.targetRoleIds = this.targetRoles
      .filter(role => role.isSelected)
      .map(role => role.id);
    
    // Collect selected skills
    this.learningGoalMapping.skillIds = this.selectedSkills.map(skill => skill.id);
    
    // Set course ID
    this.learningGoalMapping.courseId = this.courseId;
    
    // Save to API
    this.learningGoalService.saveLearningGoalMapping(this.learningGoalMapping).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = 'Learning goals mapping saved successfully';
          setTimeout(() => {
            this.onNext.emit();
          }, 1000);
        } else {
          this.errorMessage = 'Failed to save learning goals mapping: ' + response.message;
        }
      },
      error: (error: Error) => {
        console.error('Error saving learning goals mapping', error);
        this.errorMessage = 'Failed to save learning goals mapping';
      }
    });
  }
}