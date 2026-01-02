import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Add/Edit Tool Modal Component
 * 
 * Used in the Skills Framework Tools Tab to add tools to a job role.
 * Includes Video Studio integration option (Coming Soon).
 * 
 * Usage:
 * <app-add-tool-modal
 *   [jobRoleId]="selectedRole.jobRoleId"
 *   [jobRoleName]="selectedRole.jobRoleName"
 *   [tenantId]="selectedTenantId"
 *   (toolSaved)="onToolSaved($event)"
 *   (modalClosed)="onModalClosed()"
 * ></app-add-tool-modal>
 * 
 * Then call: this.addToolModal.open() or this.addToolModal.openForEdit(tool)
 */

// Interfaces
export interface RoleTool {
  roleToolId?: number;
  toolName: string;
  toolCategory: string;
  requiredLevel: string;
  requiredLevelNumber: number;
  isRequired: boolean;
  priority: number;
  description: string;
  keywords: string;
  estimatedHours: number;
}

export interface ToolFormData {
  toolName: string;
  toolCategory: string;
  requiredLevel: string;
  requiredLevelNumber: number;
  isRequired: boolean;
  priority: number;
  description: string;
  keywords: string;
  estimatedHours: number | null;
}

export interface ToolSaveEvent {
  tool: RoleTool;
  courseOption: CourseOption;
}

export type CourseOption = 'video-studio' | 'external' | 'upload' | 'existing' | 'none';

@Component({
  selector: 'app-add-tool-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-tool-modal.component.html',
  styleUrls: ['./add-tool-modal.component.css']
})
export class AddToolModalComponent {
  
  // ========================
  // INPUTS
  // ========================
  @Input() jobRoleId: number = 0;
  @Input() jobRoleName: string = '';
  @Input() tenantId: number = 0;

  // ========================
  // OUTPUTS
  // ========================
  @Output() toolSaved = new EventEmitter<ToolSaveEvent>();
  @Output() modalClosed = new EventEmitter<void>();

  // ========================
  // STATE
  // ========================
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  editingTool: RoleTool | null = null;

  // Form Data
  toolForm: ToolFormData = this.getEmptyForm();

  // Course Generation Option
  selectedOption: CourseOption = 'none';

  // Feature Flags
  isVideoStudioEnabled: boolean = false; // Set to true when Video Studio is ready

  // Level mapping
  private levelMap: Record<string, number> = {
    'Level 1': 1,
    'Level 2': 2,
    'Level 3': 3,
    'Level 4': 4,
    'Level 5': 5
  };

  // ========================
  // PUBLIC METHODS
  // ========================

  /**
   * Open modal for adding a new tool
   */
  open(): void {
    this.isEditMode = false;
    this.editingTool = null;
    this.toolForm = this.getEmptyForm();
    this.selectedOption = 'none';
    this.isModalOpen = true;
    this.preventBodyScroll(true);
  }

  /**
   * Open modal for editing an existing tool
   */
  openForEdit(tool: RoleTool): void {
    this.isEditMode = true;
    this.editingTool = tool;
    this.toolForm = {
      toolName: tool.toolName,
      toolCategory: tool.toolCategory,
      requiredLevel: tool.requiredLevel,
      requiredLevelNumber: tool.requiredLevelNumber,
      isRequired: tool.isRequired,
      priority: tool.priority,
      description: tool.description || '',
      keywords: tool.keywords || '',
      estimatedHours: tool.estimatedHours || null
    };
    this.selectedOption = 'none';
    this.isModalOpen = true;
    this.preventBodyScroll(true);
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.preventBodyScroll(false);
    this.modalClosed.emit();
  }

  /**
   * Select a course generation option
   */
  selectOption(option: CourseOption): void {
    this.selectedOption = option;
  }

  /**
   * Handle level dropdown change
   */
  onLevelChange(): void {
    this.toolForm.requiredLevelNumber = this.levelMap[this.toolForm.requiredLevel] || 0;
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return !!(
      this.toolForm.toolName?.trim() &&
      this.toolForm.toolCategory &&
      this.toolForm.requiredLevel
    );
  }

  /**
   * Get the save button text based on selected option
   */
  getButtonText(): string {
    if (this.isEditMode) {
      return 'Update Tool';
    }

    switch (this.selectedOption) {
      case 'video-studio':
        return 'Save Tool'; // Video Studio is coming soon, so just save
      case 'external':
        return 'Save & Link Course';
      case 'upload':
        return 'Save & Upload';
      case 'existing':
        return 'Save & Select Course';
      default:
        return 'Save Tool';
    }
  }

  /**
   * Save the tool
   */
  saveTool(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isSaving = true;

    // Build the tool object
    const tool: RoleTool = {
      roleToolId: this.editingTool?.roleToolId,
      toolName: this.toolForm.toolName.trim(),
      toolCategory: this.toolForm.toolCategory,
      requiredLevel: this.toolForm.requiredLevel,
      requiredLevelNumber: this.toolForm.requiredLevelNumber,
      isRequired: this.toolForm.isRequired,
      priority: this.toolForm.priority || 1,
      description: this.toolForm.description?.trim() || '',
      keywords: this.toolForm.keywords?.trim() || '',
      estimatedHours: this.toolForm.estimatedHours || 0
    };

    // Determine effective option (Video Studio becomes 'none' since it's coming soon)
    let effectiveOption = this.selectedOption;
    if (this.selectedOption === 'video-studio' && !this.isVideoStudioEnabled) {
      effectiveOption = 'none';
    }

    // Simulate API delay (replace with actual API call)
    setTimeout(() => {
      this.isSaving = false;
      
      // Emit the save event
      this.toolSaved.emit({
        tool,
        courseOption: effectiveOption
      });

      // Show success message if Video Studio was selected
      if (this.selectedOption === 'video-studio' && !this.isVideoStudioEnabled) {
        this.showToast('Tool saved! We\'ll notify you when Video Studio is ready.');
      }

      this.closeModal();
    }, 500);
  }

  /**
   * Handle "Notify me" button click
   */
  notifyMe(event: Event): void {
    event.stopPropagation();
    
    const email = prompt('Enter your email to be notified when Video Studio is ready:');
    if (email && this.isValidEmail(email)) {
      // TODO: Call API to store notification preference
      console.log('Notification request:', { email, toolName: this.toolForm.toolName });
      this.showToast(`Thanks! We'll notify you at ${email} when Video Studio is ready.`);
    } else if (email) {
      alert('Please enter a valid email address.');
    }
  }

  // ========================
  // PRIVATE METHODS
  // ========================

  /**
   * Get empty form data
   */
  private getEmptyForm(): ToolFormData {
    return {
      toolName: '',
      toolCategory: '',
      requiredLevel: '',
      requiredLevelNumber: 0,
      isRequired: true,
      priority: 1,
      description: '',
      keywords: '',
      estimatedHours: null
    };
  }

  /**
   * Prevent body scroll when modal is open
   */
  private preventBodyScroll(prevent: boolean): void {
    if (prevent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Show toast notification (replace with your toast service)
   */
  private showToast(message: string): void {
    // TODO: Replace with your toast/notification service
    console.log('Toast:', message);
    // Example: this.toastService.show(message, 'success');
  }
}
