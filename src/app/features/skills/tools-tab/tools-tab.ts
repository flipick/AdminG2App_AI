import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { SkillService } from '../../../services/skill-services';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './tools-tab.html',
  styleUrls: ['./tools-tab.css']
})
export class ToolsTab implements OnInit {
  @Input() selectedTenantId: string = '';
  
  @Output() courseSearch = new EventEmitter<{ tool: Tool, source: string }>();
  @Output() generateCourse = new EventEmitter<Tool>();
  
  // Filter Data
  sectorData: any[] = [];
  trackData: any[] = [];
  filteredRoleData: any[] = [];
  selectedSector: string = '';
  selectedTrack: string = '';
  selectedRole: string = '';
  
  // Data
  masterTools: Tool[] = MASTER_TOOLS;
  roleTools: RoleTool[] = [];
  categories = TOOL_CATEGORIES;
  levels = TOOL_LEVELS;
  
  // UI State
  showAddForm: boolean = false;
  isLoading: boolean = false;
  saveMessage: string = '';
  
  // AI Generation State
  isGeneratingAI: boolean = false;
  aiSuggestions: AIToolSuggestion[] = [];
  showAISuggestions: boolean = false;
  aiError: string = '';
  
  // Form
  selectedToolId: number | null = null;
  newTool: Partial<Tool> = {};
  selectedLevel: string = 'Level 2';
  isRequired: boolean = true;
  editingRoleToolId: number | null = null;
  
  // Search
  searchTerm: string = '';
  filteredMasterTools: Tool[] = [];
  newKeyword: string = '';

  // Claude API Config
  private apiUrl: string;
  private apiKey: string;
  private model: string;
  
  // Course Management
  toolCourses: Map<string, CourseForTool[]> = new Map();
  showLinkCourseModal: boolean = false;
  linkingToolName: string = '';
  availableCourses: any[] = [];
  selectedCourseId: number | null = null;
  isLoadingCourses: boolean = false;
  
  // Video Studio LTI
  videoStudioUrl: string = 'https://video.flipick.com';
  
  constructor(private skillService: SkillService) {
    this.apiUrl = (environment as any).claudeApiUrl || 'https://api.anthropic.com/v1/messages';
    this.apiKey = (environment as any).claudeApiKey || '';
    this.model = (environment as any).claudeModel || 'claude-sonnet-4-20250514';
  }
  
  ngOnInit(): void {
    this.loadSectorData();
  }
  
  // ============================================
  // FILTER METHODS
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
  
  onSectorChange(): void {
    this.selectedTrack = '';
    this.selectedRole = '';
    this.trackData = [];
    this.filteredRoleData = [];
    this.roleTools = [];
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    
    const sector = this.sectorData.find((s: any) => s.sectorName === this.selectedSector);
    if (sector && sector.trackList) {
      this.trackData = sector.trackList;
    }
  }
  
  onTrackChange(): void {
    this.selectedRole = '';
    this.filteredRoleData = [];
    this.roleTools = [];
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    
    const track = this.trackData.find((t: any) => t.trackName === this.selectedTrack);
    if (track && track.jobRoleList) {
      this.filteredRoleData = track.jobRoleList;
    }
  }
  
  selectRole(role: any): void {
    this.selectedRole = role.jobRoleName;
    this.loadRoleTools();
  }
  
  clearSelectedRole(): void {
    this.selectedRole = '';
    this.roleTools = [];
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    this.aiError = '';
  }
  
  // ============================================
  // LOAD DATA
  // ============================================
  
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
  
  saveRoleToolsToStorage(): void {
    if (this.selectedRole) {
      const storageKey = `roleTools_${this.selectedRole}`;
      localStorage.setItem(storageKey, JSON.stringify(this.roleTools));
    }
  }
  
  // ============================================
  // AI TOOL GENERATION
  // ============================================
  
  generateToolsWithAI(): void {
    if (!this.selectedRole || !this.selectedSector || !this.selectedTrack) {
      this.aiError = 'Please select a Sector, Track, and Role first.';
      return;
    }

    // Check if API key is configured
    if (!this.apiKey) {
      console.log('No Claude API key configured. Using default suggestions.');
      this.generateDefaultSuggestions();
      return;
    }

    this.isGeneratingAI = true;
    this.aiError = '';
    this.aiSuggestions = [];

    const prompt = this.buildAIPrompt();
    
    const body = {
      model: this.model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    };

    // Use fetch() to bypass Angular's HTTP interceptor
    fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const content = data.content?.[0]?.text || '';
      this.parseAIResponse(content);
      this.isGeneratingAI = false;
      this.showAISuggestions = true;
    })
    .catch(error => {
      console.error('AI API Error:', error);
      this.isGeneratingAI = false;
      this.aiError = 'AI generation failed. Using default suggestions.';
      this.generateDefaultSuggestions();
    });
  }

  private buildAIPrompt(): string {
    return `You are an expert in Skills Framework and Learning & Development for the ${this.selectedSector} sector, specifically in the ${this.selectedTrack} track.

Generate a comprehensive list of tools, technologies, and skills required for the role: "${this.selectedRole}"

Please provide the response in the following JSON format (and ONLY the JSON, no other text):

{
  "tools": [
    {
      "toolName": "Tool/Technology Name",
      "category": "Category (e.g., Programming Language, Framework, Cloud Platform, Soft Skill, Methodology)",
      "requiredLevelNumber": 3,
      "description": "Brief description of this tool and why it's important for this role",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "estimatedHours": 40,
      "isRequired": true,
      "priority": 1,
      "suggestedCourses": [
        {
          "courseName": "Course Title",
          "level": "Beginner/Intermediate/Advanced",
          "estimatedHours": 20,
          "description": "What this course covers",
          "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"]
        }
      ]
    }
  ]
}

Guidelines:
- Include 5-8 tools/technologies most relevant to this role
- Mix of technical tools (60-70%) and soft skills (30-40%)
- Categories: Programming Language, Frontend Framework, Backend Framework, Database, Cloud Platform, DevOps Tool, Version Control, Methodology, Soft Skill, Design Tool, Certification, AI/ML Tool
- Level should match the seniority implied by the role title (1=Beginner, 2=Foundation, 3=Intermediate, 4=Advanced, 5=Expert)
- Each tool should have 1-3 suggested courses
- Estimated hours should be realistic (10-60 hours per tool)
- Include practical keywords for course searching
- Priority 1 = most important, higher numbers = lower priority
- isRequired = true for essential skills, false for nice-to-have

Make the content specific to the ${this.selectedSector} sector and ${this.selectedTrack} track.`;
  }

  private parseAIResponse(content: string): void {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.tools && Array.isArray(parsed.tools)) {
          this.aiSuggestions = parsed.tools.map((tool: any, index: number) => ({
            toolName: tool.toolName || 'Unknown Tool',
            category: tool.category || 'Other',
            requiredLevel: `Level ${tool.requiredLevelNumber || 3}`,
            requiredLevelNumber: tool.requiredLevelNumber || 3,
            description: tool.description || '',
            keywords: tool.keywords || [],
            estimatedHours: tool.estimatedHours || 20,
            isRequired: tool.isRequired !== false,
            priority: tool.priority || index + 1,
            suggestedCourses: (tool.suggestedCourses || []).map((course: any) => ({
              courseName: course.courseName || 'Course',
              level: course.level || 'Intermediate',
              estimatedHours: course.estimatedHours || 10,
              description: course.description || '',
              learningObjectives: course.learningObjectives || []
            }))
          }));
          return;
        }
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }
    this.generateDefaultSuggestions();
  }

  private generateDefaultSuggestions(): void {
    const roleLower = this.selectedRole.toLowerCase();
    const defaultTools: AIToolSuggestion[] = [];
    
    if (roleLower.includes('engineer') || roleLower.includes('developer')) {
      defaultTools.push(
        { toolName: 'Java', category: 'Programming Language', requiredLevel: 'Level 3', requiredLevelNumber: 3, description: 'Core programming language for enterprise applications', keywords: ['java', 'jdk', 'spring'], estimatedHours: 50, isRequired: true, priority: 1, suggestedCourses: [{ courseName: 'Java Programming Fundamentals', level: 'Intermediate', estimatedHours: 25, description: 'Core Java concepts', learningObjectives: ['OOP', 'Java syntax'] }] },
        { toolName: 'Angular', category: 'Frontend Framework', requiredLevel: 'Level 3', requiredLevelNumber: 3, description: 'Modern frontend framework', keywords: ['angular', 'typescript', 'spa'], estimatedHours: 45, isRequired: true, priority: 2, suggestedCourses: [{ courseName: 'Angular Fundamentals', level: 'Intermediate', estimatedHours: 20, description: 'Building Angular apps', learningObjectives: ['Components', 'Services'] }] }
      );
    }
    
    if (roleLower.includes('manager') || roleLower.includes('lead') || roleLower.includes('head')) {
      defaultTools.push(
        { toolName: 'Team Leadership', category: 'Soft Skill', requiredLevel: 'Level 4', requiredLevelNumber: 4, description: 'Leadership skills for technical teams', keywords: ['leadership', 'management'], estimatedHours: 30, isRequired: true, priority: 1, suggestedCourses: [{ courseName: 'Technical Team Leadership', level: 'Advanced', estimatedHours: 20, description: 'Leading tech teams', learningObjectives: ['Team building', 'Motivation'] }] },
        { toolName: 'Agile & Scrum', category: 'Methodology', requiredLevel: 'Level 4', requiredLevelNumber: 4, description: 'Agile project management', keywords: ['agile', 'scrum'], estimatedHours: 25, isRequired: true, priority: 2, suggestedCourses: [{ courseName: 'Scrum Master Certification', level: 'Advanced', estimatedHours: 25, description: 'Scrum framework', learningObjectives: ['Sprint planning', 'Backlog'] }] }
      );
    }
    
    if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('architect') || roleLower.includes('data')) {
      defaultTools.push(
        { toolName: 'Python', category: 'Programming Language', requiredLevel: 'Level 4', requiredLevelNumber: 4, description: 'Primary language for AI/ML', keywords: ['python', 'ml', 'ai'], estimatedHours: 50, isRequired: true, priority: 1, suggestedCourses: [{ courseName: 'Python for ML', level: 'Advanced', estimatedHours: 30, description: 'ML with Python', learningObjectives: ['NumPy', 'Pandas'] }] },
        { toolName: 'AWS', category: 'Cloud Platform', requiredLevel: 'Level 4', requiredLevelNumber: 4, description: 'Cloud infrastructure for AI/ML', keywords: ['aws', 'cloud'], estimatedHours: 45, isRequired: true, priority: 2, suggestedCourses: [{ courseName: 'AWS Solutions Architect', level: 'Advanced', estimatedHours: 45, description: 'AWS architecture', learningObjectives: ['EC2', 'S3'] }] }
      );
    }
    
    if (roleLower.includes('ui') || roleLower.includes('designer') || roleLower.includes('ux')) {
      defaultTools.push(
        { toolName: 'Figma', category: 'Design Tool', requiredLevel: 'Level 3', requiredLevelNumber: 3, description: 'Collaborative UI/UX design', keywords: ['figma', 'ui', 'ux'], estimatedHours: 30, isRequired: true, priority: 1, suggestedCourses: [{ courseName: 'Figma for UI Design', level: 'Intermediate', estimatedHours: 20, description: 'UI design with Figma', learningObjectives: ['Components', 'Prototyping'] }] },
        { toolName: 'React', category: 'Frontend Framework', requiredLevel: 'Level 3', requiredLevelNumber: 3, description: 'Building interactive UIs', keywords: ['react', 'jsx', 'hooks'], estimatedHours: 40, isRequired: true, priority: 2, suggestedCourses: [{ courseName: 'React Development', level: 'Intermediate', estimatedHours: 25, description: 'Building React apps', learningObjectives: ['Components', 'Hooks'] }] }
      );
    }
    
    // Common tools
    defaultTools.push(
      { toolName: 'Git', category: 'Version Control', requiredLevel: 'Level 2', requiredLevelNumber: 2, description: 'Version control for collaboration', keywords: ['git', 'github'], estimatedHours: 15, isRequired: true, priority: defaultTools.length + 1, suggestedCourses: [{ courseName: 'Git Essentials', level: 'Beginner', estimatedHours: 10, description: 'Version control basics', learningObjectives: ['Git commands', 'Branching'] }] },
      { toolName: 'Problem Solving', category: 'Soft Skill', requiredLevel: 'Level 3', requiredLevelNumber: 3, description: 'Analytical thinking', keywords: ['problem solving', 'analysis'], estimatedHours: 20, isRequired: true, priority: defaultTools.length + 2, suggestedCourses: [{ courseName: 'Critical Thinking', level: 'Intermediate', estimatedHours: 15, description: 'Problem solving skills', learningObjectives: ['Analysis', 'Decision making'] }] }
    );
    
    this.aiSuggestions = defaultTools;
    this.showAISuggestions = true;
  }

  addSuggestedTool(suggestion: AIToolSuggestion): void {
    const newTool: Tool = {
      toolId: Date.now(),
      toolName: suggestion.toolName,
      category: suggestion.category,
      level: suggestion.requiredLevel,
      levelNumber: suggestion.requiredLevelNumber,
      description: suggestion.description,
      keywords: suggestion.keywords,
      estimatedHours: suggestion.estimatedHours,
      linkedInSearchQuery: suggestion.toolName.toLowerCase(),
      courseraSearchQuery: suggestion.toolName.toLowerCase()
    };
    
    const newRoleTool: RoleTool = {
      roleToolId: Date.now(),
      roleId: 0,
      roleName: this.selectedRole,
      toolId: newTool.toolId,
      tool: newTool,
      requiredLevel: suggestion.requiredLevel,
      requiredLevelNumber: suggestion.requiredLevelNumber,
      isRequired: suggestion.isRequired,
      priority: this.roleTools.length + 1,
      suggestedCourses: suggestion.suggestedCourses
    };
    
    this.roleTools.push(newRoleTool);
    this.saveRoleToolsToStorage();
    this.aiSuggestions = this.aiSuggestions.filter(s => s.toolName !== suggestion.toolName);
    
    this.saveMessage = `Added "${suggestion.toolName}" to ${this.selectedRole}`;
    setTimeout(() => this.saveMessage = '', 3000);
  }

  addAllSuggestions(): void {
    this.aiSuggestions.forEach(suggestion => {
      const newTool: Tool = {
        toolId: Date.now() + Math.random(),
        toolName: suggestion.toolName,
        category: suggestion.category,
        level: suggestion.requiredLevel,
        levelNumber: suggestion.requiredLevelNumber,
        description: suggestion.description,
        keywords: suggestion.keywords,
        estimatedHours: suggestion.estimatedHours,
        linkedInSearchQuery: suggestion.toolName.toLowerCase(),
        courseraSearchQuery: suggestion.toolName.toLowerCase()
      };
      
      const newRoleTool: RoleTool = {
        roleToolId: Date.now() + Math.random(),
        roleId: 0,
        roleName: this.selectedRole,
        toolId: newTool.toolId,
        tool: newTool,
        requiredLevel: suggestion.requiredLevel,
        requiredLevelNumber: suggestion.requiredLevelNumber,
        isRequired: suggestion.isRequired,
        priority: this.roleTools.length + 1,
        suggestedCourses: suggestion.suggestedCourses
      };
      
      this.roleTools.push(newRoleTool);
    });
    
    this.saveRoleToolsToStorage();
    this.saveMessage = `Added ${this.aiSuggestions.length} tools to ${this.selectedRole}`;
    this.aiSuggestions = [];
    this.showAISuggestions = false;
    setTimeout(() => this.saveMessage = '', 3000);
  }

  closeAISuggestions(): void {
    this.showAISuggestions = false;
  }

  // ============================================
  // FORM HANDLING
  // ============================================
  
  openAddForm(): void {
    this.showAddForm = true;
    this.editingRoleToolId = null;
    this.selectedToolId = null;
    this.newTool = {};
    this.selectedLevel = 'Level 2';
    this.isRequired = true;
    this.searchTerm = '';
    this.filteredMasterTools = [];
  }
  
  closeAddForm(): void {
    this.showAddForm = false;
    this.editingRoleToolId = null;
    this.newTool = {};
    this.searchTerm = '';
  }
  
  editRoleTool(roleTool: RoleTool): void {
    this.showAddForm = true;
    this.editingRoleToolId = roleTool.roleToolId;
    this.selectedToolId = roleTool.toolId;
    this.newTool = { ...roleTool.tool };
    this.selectedLevel = roleTool.requiredLevel;
    this.isRequired = roleTool.isRequired;
  }
  
  searchTools(): void {
    if (!this.searchTerm || this.searchTerm.length < 2) {
      this.filteredMasterTools = [];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    const assignedToolIds = this.roleTools.map(rt => rt.toolId);
    
    this.filteredMasterTools = this.masterTools
      .filter(t => !assignedToolIds.includes(t.toolId))
      .filter(t => t.toolName.toLowerCase().includes(term) || t.category.toLowerCase().includes(term) || t.keywords.some(k => k.toLowerCase().includes(term)))
      .slice(0, 10);
  }
  
  selectTool(tool: Tool): void {
    this.selectedToolId = tool.toolId;
    this.newTool = { ...tool };
    this.searchTerm = tool.toolName;
    this.filteredMasterTools = [];
  }
  
  addKeyword(): void {
    if (!this.newKeyword.trim()) return;
    if (!this.newTool.keywords) this.newTool.keywords = [];
    const keyword = this.newKeyword.trim().toLowerCase();
    if (!this.newTool.keywords.includes(keyword)) {
      this.newTool.keywords.push(keyword);
    }
    this.newKeyword = '';
  }
  
  removeKeyword(index: number): void {
    this.newTool.keywords?.splice(index, 1);
  }
  
  saveTool(): void {
    if (!this.selectedToolId && !this.newTool.toolName) {
      this.saveMessage = 'Please select or enter a tool';
      return;
    }
    
    this.isLoading = true;
    
    setTimeout(() => {
      if (this.editingRoleToolId) {
        const index = this.roleTools.findIndex(rt => rt.roleToolId === this.editingRoleToolId);
        if (index !== -1) {
          this.roleTools[index].requiredLevel = this.selectedLevel;
          this.roleTools[index].requiredLevelNumber = this.getLevelNumber(this.selectedLevel);
          this.roleTools[index].isRequired = this.isRequired;
        }
        this.saveMessage = 'Tool updated successfully!';
      } else {
        const tool = this.selectedToolId ? this.masterTools.find(t => t.toolId === this.selectedToolId)! : this.createNewTool();
        
        const newRoleTool: RoleTool = {
          roleToolId: Date.now(),
          roleId: 0,
          roleName: this.selectedRole,
          toolId: tool.toolId,
          tool: tool,
          requiredLevel: this.selectedLevel,
          requiredLevelNumber: this.getLevelNumber(this.selectedLevel),
          isRequired: this.isRequired,
          priority: this.roleTools.length + 1
        };
        
        this.roleTools.push(newRoleTool);
        this.saveMessage = 'Tool added successfully!';
      }
      
      this.saveRoleToolsToStorage();
      this.isLoading = false;
      this.closeAddForm();
      setTimeout(() => this.saveMessage = '', 3000);
    }, 300);
  }
  
  createNewTool(): Tool {
    return {
      toolId: Date.now(),
      toolName: this.newTool.toolName || 'New Tool',
      category: this.newTool.category || 'Other',
      level: this.selectedLevel,
      levelNumber: this.getLevelNumber(this.selectedLevel),
      description: this.newTool.description || '',
      keywords: this.newTool.keywords || [],
      estimatedHours: this.newTool.estimatedHours || 20,
      linkedInSearchQuery: this.newTool.toolName?.toLowerCase(),
      courseraSearchQuery: this.newTool.toolName?.toLowerCase()
    };
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
  
  getLevelNumber(level: string): number {
    const found = this.levels.find(l => l.value === level);
    return found ? found.number : 2;
  }
  
  getLevelClass(level: string): string {
    const num = this.getLevelNumber(level);
    if (num <= 2) return 'level-beginner';
    if (num === 3) return 'level-intermediate';
    return 'level-advanced';
  }
  
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Programming Language': '💻', 'Frontend Framework': '🎨', 'Backend Framework': '⚙️',
      'Database': '🗄️', 'Cloud Platform': '☁️', 'DevOps Tool': '🔧', 'Version Control': '📦',
      'Methodology': '📋', 'Soft Skill': '🤝', 'Certification': '🎓', 'Design Tool': '🖌️',
      'Project Management': '📊', 'Testing Tool': '🧪', 'AI/ML Tool': '🤖'
    };
    return icons[category] || '🔹';
  }
  
  getTotalHours(): number {
    return this.roleTools.reduce((sum, rt) => sum + (rt.tool.estimatedHours || 0), 0);
  }
  
  getRequiredCount(): number {
    return this.roleTools.filter(rt => rt.isRequired).length;
  }
  
  // ============================================
  // COURSE MANAGEMENT
  // ============================================
  
  getCoursesForTool(toolName: string): CourseForTool[] {
    return this.toolCourses.get(toolName) || [];
  }
  
  getCourseCount(toolName: string): number {
    return this.getCoursesForTool(toolName).length;
  }
  
  loadCoursesForTool(toolName: string): void {
    // Check localStorage first (demo purposes)
    const storageKey = `toolCourses_${toolName}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        this.toolCourses.set(toolName, JSON.parse(stored));
      } catch (e) {
        this.toolCourses.set(toolName, []);
      }
    }
    
    // TODO: Replace with actual API call when ready
    // this.courseService.getCoursesByTool(toolName).subscribe(...)
  }
  
  loadAllToolCourses(): void {
    this.roleTools.forEach(rt => {
      this.loadCoursesForTool(rt.tool.toolName);
    });
  }
  
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
    // For now, simulate with mock data
    setTimeout(() => {
      this.availableCourses = [
        { courseId: 1, courseName: 'Introduction to Programming', courseType: 'SCORM', duration: '10 hours' },
        { courseId: 2, courseName: 'Web Development Basics', courseType: 'SCORM', duration: '15 hours' },
        { courseId: 3, courseName: 'Advanced Concepts', courseType: 'PDF', duration: '8 hours' },
      ];
      this.isLoadingCourses = false;
    }, 500);
    
    // Actual implementation:
    // this.courseService.getAllCourses().subscribe({
    //   next: (res) => {
    //     this.availableCourses = res.result || [];
    //     this.isLoadingCourses = false;
    //   },
    //   error: () => this.isLoadingCourses = false
    // });
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
    
    // Add to local map
    const existing = this.toolCourses.get(this.linkingToolName) || [];
    existing.push(courseForTool);
    this.toolCourses.set(this.linkingToolName, existing);
    
    // Save to localStorage (demo)
    const storageKey = `toolCourses_${this.linkingToolName}`;
    localStorage.setItem(storageKey, JSON.stringify(existing));
    
    // TODO: Call API to persist
    // this.courseService.mapToolToCourse({
    //   courseId: selectedCourse.courseId,
    //   toolName: this.linkingToolName,
    //   ...
    // }).subscribe(...);
    
    this.saveMessage = `Linked "${selectedCourse.courseName}" to ${this.linkingToolName}`;
    setTimeout(() => this.saveMessage = '', 3000);
    
    this.closeLinkCourseModal();
  }
  
  unlinkCourse(toolName: string, courseId: number): void {
    if (!confirm('Remove this course from the tool?')) return;
    
    const existing = this.toolCourses.get(toolName) || [];
    const filtered = existing.filter(c => c.courseId !== courseId);
    this.toolCourses.set(toolName, filtered);
    
    // Save to localStorage
    const storageKey = `toolCourses_${toolName}`;
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    
    // TODO: Call API
    // this.courseService.removeToolMapping(courseToolId).subscribe(...);
    
    this.saveMessage = 'Course unlinked successfully';
    setTimeout(() => this.saveMessage = '', 3000);
  }
  
  // ============================================
  // VIDEO STUDIO LTI LAUNCH
  // ============================================
  
  launchVideoStudio(tool: Tool): void {
    // Build LTI launch form
    const launchParams: LTILaunchParams = {
      tenantId: parseInt(this.selectedTenantId) || 0,
      userId: 0, // Get from auth service
      toolName: tool.toolName,
      toolCategory: tool.category,
      requiredLevel: tool.level,
      keywords: tool.keywords?.join(',') || '',
      estimatedHours: tool.estimatedHours || 40
    };
    
    // For now, open Video Studio with query params (simple approach)
    // Full LTI implementation would use a form POST with OAuth signature
    const params = new URLSearchParams({
      tool_name: launchParams.toolName,
      tool_category: launchParams.toolCategory,
      required_level: launchParams.requiredLevel,
      keywords: launchParams.keywords,
      estimated_hours: launchParams.estimatedHours.toString(),
      return_url: window.location.href
    });
    
    const launchUrl = `${this.videoStudioUrl}/create?${params.toString()}`;
    
    // Open in new window
    window.open(launchUrl, '_blank', 'width=1200,height=800');
    
    // TODO: For full LTI, create a form and submit with OAuth:
    // this.submitLTILaunch(launchParams);
  }
  
  // Full LTI Launch (when backend is ready)
  private submitLTILaunch(params: LTILaunchParams): void {
    // Create hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${this.videoStudioUrl}/lti/launch`;
    form.target = '_blank';
    
    // Add LTI parameters
    const ltiParams: Record<string, string> = {
      'lti_message_type': 'ContentItemSelectionRequest',
      'lti_version': 'LTI-1p0',
      'content_item_return_url': `${window.location.origin}/api/LTI/ContentItemReturn`,
      'accept_media_types': 'application/vnd.ims.lti.v1.ltilink',
      'accept_presentation_document_targets': 'window',
      'custom_tool_name': params.toolName,
      'custom_tool_category': params.toolCategory,
      'custom_required_level': params.requiredLevel,
      'custom_keywords': params.keywords,
      'custom_estimated_hours': params.estimatedHours.toString(),
      // OAuth params would be added by backend
    };
    
    Object.entries(ltiParams).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
  
  viewCourse(courseId: number): void {
    // Open course in LMS
    window.open(`/courses/${courseId}`, '_blank');
  }
}
