import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GeneratedRoleData {
  jobRoleDescription: string;
  criticalWorkFunctions: CriticalWorkFunction[];
  coreSkills: CoreSkill[];
  tdcSkills: TdcSkill[];
}

export interface CriticalWorkFunction {
  name: string;
  keyTasks: string[];
}

export interface CoreSkill {
  skillName: string;
  proficiencyLevel: string;
}

export interface TdcSkill {
  skillName: string;
  proficiencyLevel: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiRoleService {
  private apiUrl: string;
  private apiKey: string;
  private model: string;

  constructor(private http: HttpClient) {
    // Safely access environment variables
    this.apiUrl = (environment as any).claudeApiUrl || 'https://api.anthropic.com/v1/messages';
    this.apiKey = (environment as any).claudeApiKey || '';
    this.model = (environment as any).claudeModel || 'claude-sonnet-4-20250514';
  }

  /**
   * Check if AI is configured
   */
  isAiConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.length > 0);
  }

  /**
   * Generate role data (description, skills, etc.) using Claude AI
   */
  generateRoleData(roleName: string, sectorName: string, trackName: string): Observable<GeneratedRoleData> {
    // Check if AI is configured
    if (!this.isAiConfigured()) {
      console.warn('AI not configured - returning default data');
      return of(this.getDefaultRoleData(roleName, sectorName, trackName));
    }

    const prompt = this.buildPrompt(roleName, sectorName, trackName);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    });

    const body = {
      model: this.model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      timeout(30000), // 30 second timeout
      map(response => {
        const content = response.content[0]?.text || '';
        return this.parseResponse(content, roleName, sectorName, trackName);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AI API Error:', error);
        // Return default data on error - don't throw
        return of(this.getDefaultRoleData(roleName, sectorName, trackName));
      })
    );
  }

  /**
   * Generate only job description using Claude AI
   */
  generateDescription(roleName: string, sectorName: string, trackName: string): Observable<string> {
    // Check if AI is configured
    if (!this.isAiConfigured()) {
      console.warn('AI not configured - returning default description');
      return of(this.getDefaultDescription(roleName, sectorName, trackName));
    }

    const prompt = `You are an expert in Skills Framework for the ${sectorName} sector, specifically in the ${trackName} track.

Write a professional job description for the position: "${roleName}"

Requirements:
- 2-3 sentences
- Clear and professional tone
- Describe key responsibilities and role importance
- Specific to ${sectorName} / ${trackName}

Respond with ONLY the description text, no JSON or formatting.`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    });

    const body = {
      model: this.model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      timeout(30000),
      map(response => {
        return response.content[0]?.text?.trim() || this.getDefaultDescription(roleName, sectorName, trackName);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AI API Error:', error);
        return of(this.getDefaultDescription(roleName, sectorName, trackName));
      })
    );
  }

  private getDefaultDescription(roleName: string, sectorName: string, trackName: string): string {
    return `The ${roleName} is responsible for key activities within the ${trackName} domain, contributing to organizational objectives in the ${sectorName} sector and delivering quality outcomes.`;
  }

  private buildPrompt(roleName: string, sectorName: string, trackName: string): string {
    return `You are an expert in Skills Framework for the ${sectorName} sector, specifically in the ${trackName} track.

Generate comprehensive job role data for the position: "${roleName}"

Please provide the response in the following JSON format (and ONLY the JSON, no other text):

{
  "jobRoleDescription": "A comprehensive 2-3 sentence description of this role, its responsibilities, and its importance in the organization.",
  "criticalWorkFunctions": [
    {
      "name": "Critical Work Function 1",
      "keyTasks": [
        "Key Task 1",
        "Key Task 2",
        "Key Task 3"
      ]
    },
    {
      "name": "Critical Work Function 2",
      "keyTasks": [
        "Key Task 1",
        "Key Task 2",
        "Key Task 3"
      ]
    },
    {
      "name": "Critical Work Function 3",
      "keyTasks": [
        "Key Task 1",
        "Key Task 2"
      ]
    }
  ],
  "coreSkills": [
    { "skillName": "Technical Skill 1", "proficiencyLevel": "3" },
    { "skillName": "Technical Skill 2", "proficiencyLevel": "4" },
    { "skillName": "Technical Skill 3", "proficiencyLevel": "3" },
    { "skillName": "Technical Skill 4", "proficiencyLevel": "2" }
  ],
  "tdcSkills": [
    { "skillName": "Soft Skill 1", "proficiencyLevel": "Intermediate" },
    { "skillName": "Soft Skill 2", "proficiencyLevel": "Advanced" },
    { "skillName": "Soft Skill 3", "proficiencyLevel": "Basic" }
  ]
}

Guidelines:
- Job Role Description: Clear, professional, 2-3 sentences
- Critical Work Functions: 3-5 major areas of responsibility
- Key Tasks: 2-4 specific tasks under each function
- Core Skills: 4-6 technical/hard skills relevant to the role
- Proficiency Levels for Core Skills: Use numbers 1-5 (1=Basic, 5=Expert)
- TDC Skills: 3-5 soft skills / transferable skills
- Proficiency Levels for TDC Skills: Use "Basic", "Intermediate", or "Advanced"

Make the content specific to the ${sectorName} sector and ${trackName} track.`;
  }

  private parseResponse(content: string, roleName: string, sectorName: string, trackName: string): GeneratedRoleData {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          jobRoleDescription: parsed.jobRoleDescription || this.getDefaultDescription(roleName, sectorName, trackName),
          criticalWorkFunctions: parsed.criticalWorkFunctions || [],
          coreSkills: parsed.coreSkills || [],
          tdcSkills: parsed.tdcSkills || []
        };
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }
    
    return this.getDefaultRoleData(roleName, sectorName, trackName);
  }

  private getDefaultRoleData(roleName: string, sectorName: string, trackName: string): GeneratedRoleData {
    return {
      jobRoleDescription: this.getDefaultDescription(roleName, sectorName, trackName),
      criticalWorkFunctions: [
        {
          name: 'Core Responsibilities',
          keyTasks: ['Perform primary job functions', 'Maintain quality standards', 'Collaborate with team members']
        },
        {
          name: 'Planning & Analysis',
          keyTasks: ['Analyze requirements', 'Develop solutions', 'Document processes']
        }
      ],
      coreSkills: [
        { skillName: 'Domain Knowledge', proficiencyLevel: '3' },
        { skillName: 'Problem Solving', proficiencyLevel: '3' },
        { skillName: 'Technical Analysis', proficiencyLevel: '3' }
      ],
      tdcSkills: [
        { skillName: 'Communication', proficiencyLevel: 'Intermediate' },
        { skillName: 'Teamwork', proficiencyLevel: 'Intermediate' },
        { skillName: 'Adaptability', proficiencyLevel: 'Intermediate' }
      ]
    };
  }
}
