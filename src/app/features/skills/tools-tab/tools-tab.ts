import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { SkillService } from '../../../services/skill-services';
import { AddToolModalComponent, ToolSaveEvent, RoleTool as ModalRoleTool } from './add-tool-modal/add-tool-modal.component';

// ============================================
// INTERFACES
// ============================================

export interface Tool {
  toolId: number;
  toolName: string;
  category: string;
  level: string;
  levelNumber: number;
  description: string;
  keywords: string[];
  estimatedHours: number;
  linkedInSearchQuery?: string;
  courseraSearchQuery?: string;
}

export interface RoleTool {
  roleToolId: number;
  roleId: number;
  roleName: string;
  toolId: number;
  tool: Tool;
  requiredLevel: string;
  requiredLevelNumber: number;
  isRequired: boolean;
  priority: number;
  suggestedCourses?: AISuggestedCourse[];
}

export interface AIToolSuggestion {
  toolName: string;
  category: string;
  requiredLevel: string;
  requiredLevelNumber: number;
  description: string;
  keywords: string[];
  estimatedHours: number;
  isRequired: boolean;
  priority: number;
  suggestedCourses: AISuggestedCourse[];
}

export interface AISuggestedCourse {
  courseName: string;
  level: string;
  estimatedHours: number;
  description: string;
  learningObjectives: string[];
}

export interface CourseForTool {
  courseId: number;
  courseName: string;
  courseType: string;
  duration: string;
  requiredLevel: string;
  isPrimary: boolean;
  thumbnailUrl: string;
  status: string;
}

export interface CourseTool {
  courseToolId: number;
  courseId: number;
  toolName: string;
  toolCategory: string;
  requiredLevel: string;
  requiredLevelNumber: number;
  isPrimary: boolean;
  keywords: string[];
  estimatedHours: number;
}

export interface LTILaunchParams {
  tenantId: number;
  userId: number;
  toolName: string;
  toolCategory: string;
  requiredLevel: string;
  keywords: string;
  estimatedHours: number;
}

// ============================================
// CONSTANTS
// ============================================

export const TOOL_CATEGORIES = [
  'Programming Language', 'Frontend Framework', 'Backend Framework', 'Database',
  'Cloud Platform', 'DevOps Tool', 'Version Control', 'Methodology',
  'Soft Skill', 'Certification', 'Design Tool', 'Project Management', 'Testing Tool', 'AI/ML Tool'
];

export const TOOL_LEVELS = [
  { label: 'Level 1 - Beginner', value: 'Level 1', number: 1 },
  { label: 'Level 2 - Foundation', value: 'Level 2', number: 2 },
  { label: 'Level 3 - Intermediate', value: 'Level 3', number: 3 },
  { label: 'Level 4 - Advanced', value: 'Level 4', number: 4 },
  { label: 'Level 5 - Expert', value: 'Level 5', number: 5 }
];

export const MASTER_TOOLS: Tool[] = [
  { toolId: 1, toolName: 'Java', category: 'Programming Language', level: 'Intermediate', levelNumber: 3, description: 'Object-oriented programming language for enterprise applications', keywords: ['java', 'jdk', 'spring', 'oop'], estimatedHours: 60 },
  { toolId: 2, toolName: 'Python', category: 'Programming Language', level: 'Intermediate', levelNumber: 3, description: 'Versatile language for web, data science, and automation', keywords: ['python', 'django', 'flask', 'ml'], estimatedHours: 50 },
  { toolId: 3, toolName: 'JavaScript', category: 'Programming Language', level: 'Intermediate', levelNumber: 3, description: 'Core language for web development', keywords: ['javascript', 'js', 'es6', 'nodejs'], estimatedHours: 45 },
  { toolId: 4, toolName: 'TypeScript', category: 'Programming Language', level: 'Intermediate', levelNumber: 3, description: 'Typed superset of JavaScript', keywords: ['typescript', 'ts', 'angular'], estimatedHours: 30 },
  { toolId: 5, toolName: 'C#', category: 'Programming Language', level: 'Intermediate', levelNumber: 3, description: 'Microsoft language for .NET applications', keywords: ['csharp', 'dotnet', 'unity'], estimatedHours: 55 },
  { toolId: 10, toolName: 'Angular', category: 'Frontend Framework', level: 'Intermediate', levelNumber: 3, description: 'TypeScript-based framework for SPAs', keywords: ['angular', 'typescript', 'spa', 'rxjs'], estimatedHours: 50 },
  { toolId: 11, toolName: 'React', category: 'Frontend Framework', level: 'Intermediate', levelNumber: 3, description: 'JavaScript library for building UIs', keywords: ['react', 'jsx', 'hooks', 'redux'], estimatedHours: 45 },
  { toolId: 12, toolName: 'Vue.js', category: 'Frontend Framework', level: 'Intermediate', levelNumber: 3, description: 'Progressive JavaScript framework', keywords: ['vue', 'vuex', 'spa'], estimatedHours: 40 },
  { toolId: 20, toolName: 'Spring Boot', category: 'Backend Framework', level: 'Intermediate', levelNumber: 3, description: 'Java-based framework for microservices', keywords: ['spring', 'java', 'microservices', 'api'], estimatedHours: 50 },
  { toolId: 21, toolName: 'Node.js', category: 'Backend Framework', level: 'Intermediate', levelNumber: 3, description: 'JavaScript runtime for server-side', keywords: ['nodejs', 'express', 'javascript'], estimatedHours: 40 },
  { toolId: 22, toolName: '.NET Core', category: 'Backend Framework', level: 'Intermediate', levelNumber: 3, description: 'Cross-platform framework for modern apps', keywords: ['dotnet', 'csharp', 'api'], estimatedHours: 50 },
  { toolId: 30, toolName: 'MySQL', category: 'Database', level: 'Intermediate', levelNumber: 3, description: 'Popular relational database', keywords: ['mysql', 'sql', 'database'], estimatedHours: 30 },
  { toolId: 31, toolName: 'PostgreSQL', category: 'Database', level: 'Intermediate', levelNumber: 3, description: 'Advanced relational database', keywords: ['postgresql', 'sql', 'database'], estimatedHours: 35 },
  { toolId: 32, toolName: 'MongoDB', category: 'Database', level: 'Intermediate', levelNumber: 3, description: 'NoSQL document database', keywords: ['mongodb', 'nosql', 'json'], estimatedHours: 25 },
  { toolId: 40, toolName: 'AWS', category: 'Cloud Platform', level: 'Intermediate', levelNumber: 3, description: 'Amazon Web Services cloud platform', keywords: ['aws', 'cloud', 'ec2', 's3', 'lambda'], estimatedHours: 60 },
  { toolId: 41, toolName: 'Azure', category: 'Cloud Platform', level: 'Intermediate', levelNumber: 3, description: 'Microsoft Azure cloud platform', keywords: ['azure', 'microsoft', 'cloud'], estimatedHours: 55 },
  { toolId: 42, toolName: 'Google Cloud', category: 'Cloud Platform', level: 'Intermediate', levelNumber: 3, description: 'Google Cloud Platform services', keywords: ['gcp', 'google', 'cloud', 'bigquery'], estimatedHours: 50 },
  { toolId: 50, toolName: 'Docker', category: 'DevOps Tool', level: 'Intermediate', levelNumber: 3, description: 'Container platform for applications', keywords: ['docker', 'containers', 'devops'], estimatedHours: 30 },
  { toolId: 51, toolName: 'Kubernetes', category: 'DevOps Tool', level: 'Advanced', levelNumber: 4, description: 'Container orchestration system', keywords: ['kubernetes', 'k8s', 'containers'], estimatedHours: 45 },
  { toolId: 52, toolName: 'Git', category: 'Version Control', level: 'Beginner', levelNumber: 2, description: 'Distributed version control system', keywords: ['git', 'github', 'version control'], estimatedHours: 15 },
  { toolId: 53, toolName: 'Jenkins', category: 'DevOps Tool', level: 'Intermediate', levelNumber: 3, description: 'CI/CD automation server', keywords: ['jenkins', 'ci', 'cd', 'pipeline'], estimatedHours: 25 },
  { toolId: 60, toolName: 'Agile & Scrum', category: 'Methodology', level: 'Intermediate', levelNumber: 3, description: 'Agile project management framework', keywords: ['agile', 'scrum', 'kanban', 'sprint'], estimatedHours: 20 },
  { toolId: 61, toolName: 'Team Leadership', category: 'Soft Skill', level: 'Intermediate', levelNumber: 3, description: 'Leading teams effectively', keywords: ['leadership', 'management', 'team'], estimatedHours: 30 },
  { toolId: 62, toolName: 'Technical Communication', category: 'Soft Skill', level: 'Intermediate', levelNumber: 3, description: 'Communicating technical concepts', keywords: ['communication', 'presentation', 'documentation'], estimatedHours: 20 },
  { toolId: 63, toolName: 'Problem Solving', category: 'Soft Skill', level: 'Intermediate', levelNumber: 3, description: 'Analytical and critical thinking', keywords: ['problem solving', 'critical thinking', 'analysis'], estimatedHours: 25 },
  { toolId: 70, toolName: 'TensorFlow', category: 'AI/ML Tool', level: 'Advanced', levelNumber: 4, description: 'Machine learning framework', keywords: ['tensorflow', 'ml', 'ai', 'deep learning'], estimatedHours: 50 },
  { toolId: 71, toolName: 'PyTorch', category: 'AI/ML Tool', level: 'Advanced', levelNumber: 4, description: 'Deep learning framework', keywords: ['pytorch', 'ml', 'ai', 'neural networks'], estimatedHours: 50 },
  { toolId: 80, toolName: 'Figma', category: 'Design Tool', level: 'Intermediate', levelNumber: 3, description: 'Collaborative design tool', keywords: ['figma', 'ui', 'ux', 'design'], estimatedHours: 25 },
  { toolId: 81, toolName: 'Adobe XD', category: 'Design Tool', level: 'Intermediate', levelNumber: 3, description: 'UI/UX design tool', keywords: ['adobe', 'xd', 'ui', 'design'], estimatedHours: 25 }
];

// ============================================
// COMPONENT
// ============================================

@Component({
  selector: 'app-tools-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, AddToolModalComponent],
  templateUrl: './tools-tab.html',
  styleUrls: ['./tools-tab.css']
})
export class ToolsTab implements OnInit {
  @Input() selectedTenantId: string = '';
  
  @Output() courseSearch = new EventEmitter<{ tool: Tool, source: string }>();
  @Output() generateCourse = new EventEmitter<Tool>();
  
  // Reference to Add Tool Modal
  @ViewChild('addToolModal') addToolModal!: AddToolModalComponent;
  
  // Filter Data
  sectorData: any[] = [];
  trackData: any[] = [];
  filteredRoleData: any[] = [];
  selectedSector: string = '';
  selectedTrack: string = '';
  selectedRole: string = '';
  selectedRoleId: number = 0;
  
  // Data
  masterTools: Tool[] = MASTER_TOOLS;
  roleTools: RoleTool[] = [];
  categories = TOOL_CATEGORIES;
  levels = TOOL_LEVELS;
  
  // Form State - Keep for backward compatibility
  showAddForm: boolean = false;
  editingRoleToolId: number | null = null;
  selectedToolId: number | null = null;
  searchTerm: string = '';
  filteredMasterTools: Tool[] = [];
  newTool: Partial<Tool> = {};
  selectedLevel: string = 'Level 3';
  isRequired: boolean = true;
  newKeyword: string = '';
  
  // UI State
  isLoading: boolean = false;
  saveMessage: string = '';
  
  // AI Generation
  isGeneratingAI: boolean = false;
  aiError: string = '';
  showAISuggestions: boolean = false;
  aiSuggestions: AIToolSuggestion[] = [];
  
  // Course Linking
  showLinkCourseModal: boolean = false;
  linkingToolName: string = '';
  availableCourses: any[] = [];
  selectedCourseId: number | null = null;
  isLoadingCourses: boolean = false;
  toolCourses: Map<string, CourseForTool[]> = new Map();
  
  // Video Studio
  videoStudioUrl: string = 'https://video.flipick.com';
  
  // Claude API Config
  private apiUrl: string;
  private apiKey: string;
  private model: string;
  
  constructor(private skillService: SkillService) {
    this.apiUrl = (environment as any).claudeApiUrl || 'https://api.anthropic.com/v1/messages';
    this.apiKey = (environment as any).claudeApiKey || '';
    this.model = (environment as any).claudeModel || 'claude-sonnet-4-20250514';
  }

  ngOnInit(): void {
    this.loadSectorData();
  }

  // ============================================
  // DATA LOADING
  // ============================================
  
  loadSectorData(): void {
    this.skillService.getSectorsTracksJobRoles(0, 0).subscribe({
      next: (res: any) => {
        if (!res.isError && res.statusCode === 200 && res.result?.data) {
          this.sectorData = res.result.data;
        }
      },
      error: (err: any) => console.error('Error loading sector data:', err)
    });
  }

  // ============================================
  // FILTER HANDLERS
  // ============================================
  
  onSectorChange(): void {
    this.trackData = [];
    this.filteredRoleData = [];
    this.selectedTrack = '';
    this.selectedRole = '';
    this.roleTools = [];
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    
    if (this.selectedSector) {
      const sector = this.sectorData.find((s: any) => s.sectorName === this.selectedSector);
      if (sector && sector.trackList) {
        this.trackData = sector.trackList;
      }
    }
  }

  onTrackChange(): void {
    this.filteredRoleData = [];
    this.selectedRole = '';
    this.roleTools = [];
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    
    if (this.selectedTrack) {
      const track = this.trackData.find((t: any) => t.trackName === this.selectedTrack);
      if (track && track.jobRoleList) {
        this.filteredRoleData = track.jobRoleList;
      }
    }
  }

  selectRole(role: any): void {
    this.selectedRole = role.jobRoleName;
    this.selectedRoleId = role.jobRoleId;
    this.loadRoleTools();
  }

  clearSelectedRole(): void {
    this.selectedRole = '';
    this.selectedRoleId = 0;
    this.roleTools = [];
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    this.aiError = '';
  }

  loadRoleTools(): void {
    if (!this.selectedRole) {
      this.roleTools = [];
      return;
    }
    
    const storageKey = `roleTools_${this.selectedRole}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        this.roleTools = JSON.parse(stored);
      } catch (e) {
        this.roleTools = [];
      }
    } else {
      this.roleTools = [];
    }
  }

  // ============================================
  // ADD TOOL MODAL - NEW IMPLEMENTATION
  // ============================================
  
  openAddToolModal(): void {
    if (!this.selectedRole) {
      alert('Please select a role first');
      return;
    }
    this.addToolModal.open();
  }

  openEditToolModal(roleTool: RoleTool): void {
    // Convert RoleTool to ModalRoleTool format and open for edit
    const modalTool: ModalRoleTool = {
      roleToolId: roleTool.roleToolId,
      toolName: roleTool.tool.toolName,
      toolCategory: roleTool.tool.category,
      requiredLevel: roleTool.requiredLevel,
      requiredLevelNumber: roleTool.requiredLevelNumber,
      isRequired: roleTool.isRequired,
      priority: roleTool.priority,
      description: roleTool.tool.description,
      keywords: roleTool.tool.keywords?.join(', ') || '',
      estimatedHours: roleTool.tool.estimatedHours
    };
    this.addToolModal.openForEdit(modalTool);
  }

  onToolSaved(event: ToolSaveEvent): void {
    console.log('Tool saved:', event);
    
    const { tool, courseOption } = event;
    
    // Check if tool already exists
    const existingIndex = this.roleTools.findIndex(
      rt => rt.tool.toolName.toLowerCase() === tool.toolName.toLowerCase()
    );
    
    // Create Tool object
    const toolObj: Tool = {
      toolId: existingIndex >= 0 ? this.roleTools[existingIndex].tool.toolId : Date.now(),
      toolName: tool.toolName,
      category: tool.toolCategory,
      level: tool.requiredLevel,
      levelNumber: tool.requiredLevelNumber,
      description: tool.description,
      keywords: tool.keywords ? tool.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      estimatedHours: tool.estimatedHours
    };
    
    // Create or update RoleTool
    const roleTool: RoleTool = {
      roleToolId: tool.roleToolId || Date.now(),
      roleId: this.selectedRoleId,
      roleName: this.selectedRole,
      toolId: toolObj.toolId,
      tool: toolObj,
      requiredLevel: tool.requiredLevel,
      requiredLevelNumber: tool.requiredLevelNumber,
      isRequired: tool.isRequired,
      priority: tool.priority
    };
    
    if (existingIndex >= 0) {
      // Update existing
      this.roleTools[existingIndex] = roleTool;
    } else {
      // Add new
      this.roleTools.push(roleTool);
    }
    
    // Save to localStorage
    this.saveRoleToolsToStorage();
    
    // Handle course option
    switch (courseOption) {
      case 'external':
        this.openExternalCourseLinker(toolObj);
        break;
      case 'upload':
        this.openScormUploader(toolObj);
        break;
      case 'existing':
        this.openLinkCourseModal(toolObj.toolName);
        break;
      case 'video-studio':
        // Coming soon - just show message
        this.saveMessage = `Tool "${tool.toolName}" saved. Video Studio integration coming soon!`;
        setTimeout(() => this.saveMessage = '', 4000);
        break;
      default:
        this.saveMessage = `Tool "${tool.toolName}" saved successfully`;
        setTimeout(() => this.saveMessage = '', 3000);
    }
  }

  onToolModalClosed(): void {
    console.log('Tool modal closed');
  }

  private openExternalCourseLinker(tool: Tool): void {
    // TODO: Implement external course linking
    // For now, open LinkedIn Learning search
    const searchQuery = encodeURIComponent(tool.toolName);
    window.open(`https://www.linkedin.com/learning/search?keywords=${searchQuery}`, '_blank');
    this.saveMessage = `Tool "${tool.toolName}" saved. Find courses on LinkedIn Learning.`;
    setTimeout(() => this.saveMessage = '', 4000);
  }

  private openScormUploader(tool: Tool): void {
    // TODO: Implement SCORM upload modal
    this.saveMessage = `Tool "${tool.toolName}" saved. SCORM uploader coming soon.`;
    setTimeout(() => this.saveMessage = '', 4000);
  }

  saveRoleToolsToStorage(): void {
    const key = `roleTools_${this.selectedRole}`;
    localStorage.setItem(key, JSON.stringify(this.roleTools));
  }

  // ============================================
  // OLD FORM METHODS (Keep for compatibility)
  // ============================================
  
  openAddForm(): void {
    // Use new modal instead
    this.openAddToolModal();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingRoleToolId = null;
    this.selectedToolId = null;
    this.searchTerm = '';
    this.filteredMasterTools = [];
    this.newTool = {};
    this.selectedLevel = 'Level 3';
    this.isRequired = true;
    this.newKeyword = '';
  }

  searchTools(): void {
    if (!this.searchTerm || this.searchTerm.length < 2) {
      this.filteredMasterTools = [];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredMasterTools = this.masterTools.filter(tool =>
      tool.toolName.toLowerCase().includes(term) ||
      tool.category.toLowerCase().includes(term) ||
      tool.keywords?.some(kw => kw.toLowerCase().includes(term))
    ).slice(0, 8);
  }

  selectTool(tool: Tool): void {
    this.selectedToolId = tool.toolId;
    this.newTool = { ...tool };
    this.searchTerm = '';
    this.filteredMasterTools = [];
  }

  addKeyword(): void {
    if (!this.newKeyword?.trim()) return;
    
    if (!this.newTool.keywords) {
      this.newTool.keywords = [];
    }
    
    if (!this.newTool.keywords.includes(this.newKeyword.trim().toLowerCase())) {
      this.newTool.keywords.push(this.newKeyword.trim().toLowerCase());
    }
    
    this.newKeyword = '';
  }

  removeKeyword(index: number): void {
    this.newTool.keywords?.splice(index, 1);
  }

  saveTool(): void {
    // Delegate to new modal if open, otherwise use legacy save
    if (!this.newTool.toolName && !this.selectedToolId) return;
    
    this.isLoading = true;
    
    const tool: Tool = this.selectedToolId
      ? this.masterTools.find(t => t.toolId === this.selectedToolId)!
      : {
          toolId: Date.now(),
          toolName: this.newTool.toolName || '',
          category: this.newTool.category || '',
          level: this.selectedLevel,
          levelNumber: this.getLevelNumber(this.selectedLevel),
          description: this.newTool.description || '',
          keywords: this.newTool.keywords || [],
          estimatedHours: this.newTool.estimatedHours || 40
        };
    
    const roleTool: RoleTool = {
      roleToolId: this.editingRoleToolId || Date.now(),
      roleId: this.selectedRoleId,
      roleName: this.selectedRole,
      toolId: tool.toolId,
      tool: tool,
      requiredLevel: this.selectedLevel,
      requiredLevelNumber: this.getLevelNumber(this.selectedLevel),
      isRequired: this.isRequired,
      priority: 1
    };
    
    // Simulate API delay
    setTimeout(() => {
      if (this.editingRoleToolId) {
        const index = this.roleTools.findIndex(rt => rt.roleToolId === this.editingRoleToolId);
        if (index >= 0) {
          this.roleTools[index] = roleTool;
        }
      } else {
        // Check if already exists
        const existingIndex = this.roleTools.findIndex(
          rt => rt.tool.toolName.toLowerCase() === tool.toolName.toLowerCase()
        );
        if (existingIndex >= 0) {
          this.roleTools[existingIndex] = roleTool;
        } else {
          this.roleTools.push(roleTool);
        }
      }
      
      this.saveRoleToolsToStorage();
      
      this.isLoading = false;
      this.saveMessage = `Tool "${tool.toolName}" ${this.editingRoleToolId ? 'updated' : 'added'} successfully`;
      setTimeout(() => this.saveMessage = '', 3000);
      
      this.closeAddForm();
    }, 500);
  }

  // ============================================
  // TOOL ACTIONS
  // ============================================
  
  editRoleTool(roleTool: RoleTool): void {
    this.openEditToolModal(roleTool);
  }

  deleteTool(roleTool: RoleTool): void {
    if (confirm(`Remove "${roleTool.tool.toolName}" from this role?`)) {
      this.roleTools = this.roleTools.filter(rt => rt.roleToolId !== roleTool.roleToolId);
      this.saveRoleToolsToStorage();
      this.saveMessage = 'Tool removed successfully!';
      setTimeout(() => this.saveMessage = '', 3000);
    }
  }
  
  searchLinkedIn(tool: Tool): void {
    const query = tool.linkedInSearchQuery || tool.toolName;
    window.open(`https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(query)}`, '_blank');
  }
  
  searchCoursera(tool: Tool): void {
    const query = tool.courseraSearchQuery || tool.toolName;
    window.open(`https://www.coursera.org/search?query=${encodeURIComponent(query)}`, '_blank');
  }
  
  onGenerateCourse(tool: Tool): void {
    this.generateCourse.emit(tool);
    alert(`AI Course Generation for "${tool.toolName}" coming soon!`);
  }

  // ============================================
  // AI GENERATION
  // ============================================
  
  generateToolsWithAI(): void {
    if (!this.selectedRole) return;
    
    this.isGeneratingAI = true;
    this.aiError = '';
    
    // Simulate AI generation
    setTimeout(() => {
      this.aiSuggestions = this.getMockAISuggestions();
      this.showAISuggestions = true;
      this.isGeneratingAI = false;
    }, 2000);
    
    // TODO: Replace with actual API call
    // this.skillService.generateToolsForRole(this.selectedRole).subscribe({
    //   next: (res) => {
    //     this.aiSuggestions = res.result || [];
    //     this.showAISuggestions = true;
    //     this.isGeneratingAI = false;
    //   },
    //   error: (err) => {
    //     this.aiError = 'Failed to generate suggestions. Please try again.';
    //     this.isGeneratingAI = false;
    //   }
    // });
  }

  getMockAISuggestions(): AIToolSuggestion[] {
    const roleLower = this.selectedRole.toLowerCase();
    
    if (roleLower.includes('frontend') || roleLower.includes('ui')) {
      return [
        {
          toolName: 'React', category: 'Frontend Framework', requiredLevel: 'Level 4', requiredLevelNumber: 4,
          description: 'Modern JavaScript library for building user interfaces', keywords: ['react', 'jsx', 'hooks'],
          estimatedHours: 50, isRequired: true, priority: 1,
          suggestedCourses: [
            { courseName: 'React Fundamentals', level: 'Level 2-3', estimatedHours: 20, description: 'Core React concepts', learningObjectives: ['Components', 'Props', 'State'] },
            { courseName: 'Advanced React Patterns', level: 'Level 4', estimatedHours: 15, description: 'Advanced patterns', learningObjectives: ['Hooks', 'Context', 'Performance'] }
          ]
        },
        {
          toolName: 'TypeScript', category: 'Programming Language', requiredLevel: 'Level 3', requiredLevelNumber: 3,
          description: 'Typed superset of JavaScript', keywords: ['typescript', 'types', 'interfaces'],
          estimatedHours: 30, isRequired: true, priority: 2, suggestedCourses: []
        }
      ];
    }
    
    // Default suggestions
    return [
      {
        toolName: 'Git', category: 'Version Control', requiredLevel: 'Level 3', requiredLevelNumber: 3,
        description: 'Distributed version control system', keywords: ['git', 'github', 'version control'],
        estimatedHours: 15, isRequired: true, priority: 1, suggestedCourses: []
      },
      {
        toolName: 'Agile & Scrum', category: 'Methodology', requiredLevel: 'Level 3', requiredLevelNumber: 3,
        description: 'Agile project management', keywords: ['agile', 'scrum', 'kanban'],
        estimatedHours: 20, isRequired: false, priority: 2, suggestedCourses: []
      }
    ];
  }

  addSuggestedTool(suggestion: AIToolSuggestion): void {
    const tool: Tool = {
      toolId: Date.now(),
      toolName: suggestion.toolName,
      category: suggestion.category,
      level: suggestion.requiredLevel,
      levelNumber: suggestion.requiredLevelNumber,
      description: suggestion.description,
      keywords: suggestion.keywords,
      estimatedHours: suggestion.estimatedHours
    };
    
    const roleTool: RoleTool = {
      roleToolId: Date.now(),
      roleId: this.selectedRoleId,
      roleName: this.selectedRole,
      toolId: tool.toolId,
      tool: tool,
      requiredLevel: suggestion.requiredLevel,
      requiredLevelNumber: suggestion.requiredLevelNumber,
      isRequired: suggestion.isRequired,
      priority: suggestion.priority,
      suggestedCourses: suggestion.suggestedCourses
    };
    
    // Check if exists
    const existing = this.roleTools.find(rt => rt.tool.toolName.toLowerCase() === tool.toolName.toLowerCase());
    if (!existing) {
      this.roleTools.push(roleTool);
      this.saveRoleToolsToStorage();
    }
    
    // Remove from suggestions
    this.aiSuggestions = this.aiSuggestions.filter(s => s.toolName !== suggestion.toolName);
    
    this.saveMessage = `Added "${tool.toolName}" to ${this.selectedRole}`;
    setTimeout(() => this.saveMessage = '', 3000);
    
    if (this.aiSuggestions.length === 0) {
      this.closeAISuggestions();
    }
  }

  addAllSuggestions(): void {
    this.aiSuggestions.forEach(suggestion => {
      const existing = this.roleTools.find(rt => rt.tool.toolName.toLowerCase() === suggestion.toolName.toLowerCase());
      if (!existing) {
        const tool: Tool = {
          toolId: Date.now() + Math.random(),
          toolName: suggestion.toolName,
          category: suggestion.category,
          level: suggestion.requiredLevel,
          levelNumber: suggestion.requiredLevelNumber,
          description: suggestion.description,
          keywords: suggestion.keywords,
          estimatedHours: suggestion.estimatedHours
        };
        
        this.roleTools.push({
          roleToolId: Date.now() + Math.random(),
          roleId: this.selectedRoleId,
          roleName: this.selectedRole,
          toolId: tool.toolId,
          tool: tool,
          requiredLevel: suggestion.requiredLevel,
          requiredLevelNumber: suggestion.requiredLevelNumber,
          isRequired: suggestion.isRequired,
          priority: suggestion.priority,
          suggestedCourses: suggestion.suggestedCourses
        });
      }
    });
    
    this.saveRoleToolsToStorage();
    
    this.saveMessage = `Added ${this.aiSuggestions.length} tools to ${this.selectedRole}`;
    setTimeout(() => this.saveMessage = '', 3000);
    
    this.closeAISuggestions();
  }

  closeAISuggestions(): void {
    this.showAISuggestions = false;
    this.aiSuggestions = [];
  }

  // ============================================
  // HELPERS
  // ============================================
  
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Programming Language': '💻',
      'Frontend Framework': '🎨',
      'Backend Framework': '⚙️',
      'Database': '🗄️',
      'Cloud Platform': '☁️',
      'DevOps Tool': '🔧',
      'Version Control': '📝',
      'Methodology': '📊',
      'Soft Skill': '🤝',
      'Certification': '📜',
      'Design Tool': '🖌️',
      'Project Management': '📋',
      'Testing Tool': '🧪',
      'AI/ML Tool': '🤖'
    };
    return icons[category] || '🔧';
  }

  getLevelClass(level: string): string {
    const levelNum = parseInt(level.replace(/\D/g, '')) || 3;
    if (levelNum <= 2) return 'level-beginner';
    if (levelNum === 3) return 'level-intermediate';
    return 'level-advanced';
  }

  getLevelNumber(level: string): number {
    const levelObj = this.levels.find(l => l.value === level);
    return levelObj?.number || 3;
  }

  getRequiredCount(): number {
    return this.roleTools.filter(rt => rt.isRequired).length;
  }

  getTotalHours(): number {
    return this.roleTools.reduce((sum, rt) => sum + (rt.tool.estimatedHours || 0), 0);
  }

  getCoursesForTool(toolName: string): CourseForTool[] {
    return this.toolCourses.get(toolName) || [];
  }

  getCourseCount(toolName: string): number {
    return this.getCoursesForTool(toolName).length;
  }

  // ============================================
  // COURSE LINKING
  // ============================================
  
  openLinkCourseModal(toolName: string): void {
    this.linkingToolName = toolName;
    this.showLinkCourseModal = true;
    this.selectedCourseId = null;
    this.loadAvailableCourses();
  }
  
  closeLinkCourseModal(): void {
    this.showLinkCourseModal = false;
    this.linkingToolName = '';
    this.availableCourses = [];
  }
  
  loadAvailableCourses(): void {
    this.isLoadingCourses = true;
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.availableCourses = [
        { courseId: 1, courseName: 'Introduction to Programming', courseType: 'SCORM', duration: '10 hours' },
        { courseId: 2, courseName: 'Web Development Basics', courseType: 'SCORM', duration: '15 hours' },
        { courseId: 3, courseName: 'Advanced Concepts', courseType: 'PDF', duration: '8 hours' },
      ];
      this.isLoadingCourses = false;
    }, 500);
  }
  
  linkCourseToTool(): void {
    if (!this.selectedCourseId || !this.linkingToolName) return;
    
    const selectedCourse = this.availableCourses.find(c => c.courseId === this.selectedCourseId);
    if (!selectedCourse) return;
    
    const courseForTool: CourseForTool = {
      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      courseType: selectedCourse.courseType,
      duration: selectedCourse.duration,
      requiredLevel: 'Level 3',
      isPrimary: this.getCourseCount(this.linkingToolName) === 0,
      thumbnailUrl: '',
      status: 'Active'
    };
    
    const existing = this.toolCourses.get(this.linkingToolName) || [];
    existing.push(courseForTool);
    this.toolCourses.set(this.linkingToolName, existing);
    
    const storageKey = `toolCourses_${this.linkingToolName}`;
    localStorage.setItem(storageKey, JSON.stringify(existing));
    
    this.saveMessage = `Linked "${selectedCourse.courseName}" to ${this.linkingToolName}`;
    setTimeout(() => this.saveMessage = '', 3000);
    
    this.closeLinkCourseModal();
  }
  
  unlinkCourse(toolName: string, courseId: number): void {
    if (!confirm('Remove this course from the tool?')) return;
    
    const existing = this.toolCourses.get(toolName) || [];
    const filtered = existing.filter(c => c.courseId !== courseId);
    this.toolCourses.set(toolName, filtered);
    
    const storageKey = `toolCourses_${toolName}`;
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    
    this.saveMessage = 'Course unlinked successfully';
    setTimeout(() => this.saveMessage = '', 3000);
  }
  
  // ============================================
  // VIDEO STUDIO LTI LAUNCH
  // ============================================
  
  launchVideoStudio(tool: Tool): void {
    const launchParams: LTILaunchParams = {
      tenantId: parseInt(this.selectedTenantId) || 0,
      userId: 0,
      toolName: tool.toolName,
      toolCategory: tool.category,
      requiredLevel: tool.level,
      keywords: tool.keywords?.join(',') || '',
      estimatedHours: tool.estimatedHours || 40
    };
    
    const params = new URLSearchParams({
      tool_name: launchParams.toolName,
      tool_category: launchParams.toolCategory,
      required_level: launchParams.requiredLevel,
      keywords: launchParams.keywords,
      estimated_hours: launchParams.estimatedHours.toString(),
      return_url: window.location.href
    });
    
    const launchUrl = `${this.videoStudioUrl}/create?${params.toString()}`;
    window.open(launchUrl, '_blank', 'width=1200,height=800');
  }
  
  viewCourse(courseId: number): void {
    window.open(`/courses/${courseId}`, '_blank');
  }
}
