import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolsTab } from './tools-tab/tools-tab';

// Services
import { SkillService } from '../../services/skill-services';
import { TenantService } from '../../services/tenant-service';
import { PermissionService } from '../../services/permission-service';
import { getTenantId } from '../../services/utility';

// Models
import { 
  CoreSkillGap, 
  IJobRole, 
  IJobSector, 
  IJobTrack, 
  KeyTask, 
  TdcSkillGap, 
  GroupedKeyTask 
} from '../../model/skill';

// Child Components
import { AddSectorTrackRole } from './add-sector-track-role/add-sector-track-role';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface ApiResponse<T> {
  isError: boolean;
  statusCode: number;
  result?: T;
  message?: string;
}

interface SectorApiResult {
  data: IJobSector[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalRecordsText: string;
}

type TabType = 'browse-roles' | 'custom-roles' | 'manage-skills' | 'tools';

// ============================================
// COMPONENT
// ============================================
@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, AddSectorTrackRole, ToolsTab],
  templateUrl: './skills.html',
  styleUrls: ['./skills.css']
})
export class Skills implements OnInit {
  
  // ============================================
  // VIEW CHILDREN
  // ============================================
  @ViewChild('trackSelect') trackSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('sectorSelect') sectorSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('trackSelectManageSkills') trackSelectManageSkills!: ElementRef<HTMLSelectElement>;
  @ViewChild('sectorSelectManageSkills') sectorSelectManageSkills!: ElementRef<HTMLSelectElement>;
  @ViewChildren('editBtn') editButtons!: QueryList<ElementRef>;

  // ============================================
  // STATE: Tabs
  // ============================================
  activeTab: TabType = 'browse-roles';

  // ============================================
  // STATE: Loading & Feedback
  // ============================================
  isLoading = false;
  isSaving = false;
  isAssigning = false;
  successMessage = '';
  errorMessage = '';

  // ============================================
  // STATE: Data
  // ============================================
  sectorData: IJobSector[] = [];
  trackData: IJobTrack[] = [];
  roleData: IJobRole[] = [];
  keyTaskList: KeyTask[] = [];
  groupedKeyData: GroupedKeyTask[] = [];
  coreSkills: CoreSkillGap[] = [];
  tdcSkills: TdcSkillGap[] = [];
  tenantJobRoles: any[] = [];
  tenantlist: any[] = [];
  
  // Tenant Roles tab specific
  tenantAssignedRoles: IJobRole[] = [];
  isEditingSkills = false;
  roleSearchTerm = '';
  
  // Custom Roles tab specific
  customRolesList: any[] = [];

  // ============================================
  // STATE: Selections
  // ============================================
  selectedTenant = '';
  selectedSector = '';
  selectedTrack = '';
  selectedRole = '';
  selectedTenantId = '';
  selectedSectorId = '';
  selectedTrackId = '';
  selectedIds = new Set<string>();

  // ============================================
  // STATE: UI Modes
  // ============================================
  isDropdownDisabled = false;
  isCoreEditing = false;
  isTdcEditing = false;
  permissions: any = {};

  // ============================================
  // CONSTRUCTOR
  // ============================================
  constructor(
    private router: Router,
    private skillService: SkillService,
    private tenantService: TenantService,
    private permissionService: PermissionService
  ) {}

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    this.selectedTenantId = getTenantId() || '';
    this.permissions = this.permissionService.getPermission('SkillFramework');
    this.loadTenant();
    this.getSectorData();
  }

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================
  get hasSelection(): boolean {
    return this.selectedIds.size > 0;
  }

  // ============================================
  // TAB NAVIGATION
  // ============================================
  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    this.clearMessages();
    
    // Reset edit state when leaving Manage Skills tab
    if (tab !== 'manage-skills') {
      this.isEditingSkills = false;
      this.groupedKeyData = [];
      this.coreSkills = [];
      this.tdcSkills = [];
    }
    
    // Auto-load assigned roles when switching to Manage Skills tab
    if (tab === 'manage-skills' && this.selectedTenantId) {
      this.loadTenantRoles();
    }
  }

  // ============================================
  // MESSAGE HELPERS
  // ============================================
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      if (this.successMessage === message) {
        this.successMessage = '';
      }
    }, 5000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ============================================
  // DATA LOADING
  // ============================================
  loadTenant(): void {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success && res.result) {
          this.tenantlist = res.result;
        }
      },
      error: (err: any) => {
        console.error('Error fetching tenants:', err);
        this.showError('Failed to load tenants');
      }
    });
  }

  getSectorData(): void {
    this.isLoading = true;
    
    this.skillService.getSectorsTracksJobRoles(0, 0).subscribe({
      next: (res: ApiResponse<SectorApiResult>) => {
        this.isLoading = false;
        if (!res.isError && res.statusCode === 200 && res.result?.data) {
          this.sectorData = res.result.data;
        } else {
          this.showError('Failed to fetch sector data');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleApiError(error, 'fetching sector data');
      }
    });
  }

  // ============================================
  // FILTER HANDLERS
  // ============================================
  onTenantChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOption = target.options[target.selectedIndex];
    
    this.selectedTenantId = target.value;
    this.selectedTenant = selectedOption?.text || '';
    
    this.resetFilters();
    this.clearMessages();
  }

  onSectorChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value; // This is now the sectorName
    
    this.selectedSector = selectedValue;
    this.selectedSectorId = '';
    
    // Find sector by name
    const selectedSector = this.sectorData.find(s => s.sectorName === selectedValue);
    if (selectedSector) {
      this.selectedSectorId = selectedSector.sectorId.toString();
      this.trackData = selectedSector.trackList || [];
    } else {
      this.trackData = [];
    }
    
    // Reset track selection
    this.selectedTrack = '';
    this.selectedTrackId = '';
  }

  onTrackChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value; // This is now the trackName
    
    this.selectedTrack = selectedValue;
    
    // Find track to get ID
    const selectedTrack = this.trackData.find(t => t.trackName === selectedValue);
    this.selectedTrackId = selectedTrack ? selectedTrack.trackId.toString() : '';
  }

  private resetFilters(): void {
    this.selectedSector = '';
    this.selectedTrack = '';
    this.selectedSectorId = '';
    this.selectedTrackId = '';
    this.trackData = [];
    this.roleData = [];
    this.selectedIds.clear();
    this.tenantAssignedRoles = [];
    this.customRolesList = [];
    this.roleSearchTerm = '';
  }

  // ============================================
  // SSF BROWSER: Apply Filter
  // ============================================
  onApplyFilter(): void {
    this.clearMessages();
    this.keyTaskList = [];
    this.groupedKeyData = [];

    if (!this.trackData.length) {
      this.roleData = [];
      return;
    }

    const selectedTrack = this.trackData.find(t => t.trackName === this.selectedTrack);
    
    if (selectedTrack) {
      this.roleData = selectedTrack.jobRoleList.map(role => ({
        ...role,
        isChecked: false,
        isCheckedAsignToTenant: false
      }));
      this.getTenantJobRoles();
    } else {
      this.roleData = [];
    }
  }

  // ============================================
  // SSF BROWSER: Role Selection
  // ============================================
  onCheckboxChange(event: Event, role: IJobRole): void {
    event.stopPropagation();
    const roleId = role.jobRoleId.toString();
    
    role.isChecked = !role.isChecked;
    
    if (role.isChecked) {
      this.selectedIds.add(roleId);
    } else {
      this.selectedIds.delete(roleId);
    }
  }

  onAssignToTenant(): void {
    if (!this.hasSelection || !this.selectedTenantId) {
      this.showError('Please select roles to assign');
      return;
    }

    this.isAssigning = true;
    
    const payload = {
      SelectedTrack: this.selectedTrack,
      SelectedSector: this.selectedSector,
      SelectedTenant: this.selectedTenantId,
      SelectedRoleId: Array.from(this.selectedIds)
    };

    this.skillService.assignRolesToTenant(payload).subscribe({
      next: () => {
        this.isAssigning = false;
        this.showSuccess('Roles selected for tenant successfully!');
        this.onApplyFilter();
      },
      error: (err) => {
        this.isAssigning = false;
        this.showError('Failed to assign roles. Please try again.');
        console.error('Assign failed:', err);
      }
    });
  }

  getTenantJobRoles(): void {
    const request = {
      sector: this.selectedSector,
      track: this.selectedTrack,
      tenantId: this.selectedTenantId
    };

    this.skillService.getTenantJobRoles(request).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.tenantJobRoles = res.result || [];
          this.selectedIds.clear();

          this.roleData = this.roleData.map(role => {
            const isAssigned = this.tenantJobRoles.some(
              (t: any) => t.jobRoleId === role.jobRoleId
            );

            if (isAssigned) {
              this.selectedIds.add(role.jobRoleId.toString());
            }

            return {
              ...role,
              isChecked: isAssigned,
              isCheckedAsignToTenant: isAssigned
            };
          });
        }
      },
      error: (err: any) => {
        console.error('Error fetching tenant job roles:', err);
      }
    });
  }

  // ============================================
  // MANAGE SKILLS: Load Assigned Roles
  // ============================================
  
  // Getter for filtered roles based on search term
  get filteredTenantRoles(): IJobRole[] {
    if (!this.roleSearchTerm.trim()) {
      return this.tenantAssignedRoles;
    }
    const searchLower = this.roleSearchTerm.toLowerCase();
    return this.tenantAssignedRoles.filter(role => {
      const roleName = role.jobRoleName || role.jobRole || '';
      const sectorName = role.sectorName || role.sector || '';
      const trackName = role.trackName || role.track || '';
      const description = role.jobRoleDescription || '';
      
      return roleName.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower) ||
        sectorName.toLowerCase().includes(searchLower) ||
        trackName.toLowerCase().includes(searchLower);
    });
  }

  onTenantChangeManageSkills(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const selectedText = selectElement.options[selectElement.selectedIndex].text;
    
    this.selectedTenantId = selectedValue;
    this.selectedTenant = selectedText !== 'Select Tenant' ? selectedText : '';
    this.roleSearchTerm = '';
    
    if (selectedValue) {
      this.loadTenantRoles();
    } else {
      this.tenantAssignedRoles = [];
    }
  }

  loadTenantRoles(): void {
    if (!this.selectedTenantId) {
      this.showError('Please select a tenant first');
      return;
    }

    this.isLoading = true;
    this.tenantAssignedRoles = [];

    // Load ALL roles for tenant (no sector/track filter)
    const request = {
      sector: '',
      track: '',
      tenantId: this.selectedTenantId
    };

    console.log('Loading tenant roles with request:', request);

    this.skillService.getTenantJobRoles(request).subscribe({
      next: (res: any) => {
        console.log('getTenantJobRoles response:', res);
        this.isLoading = false;
        if (res.statusCode === 200) {
          // Get all assigned roles and enrich with sector/track info
          const roles = res.result || [];
          console.log('Raw roles:', roles);
          this.tenantAssignedRoles = this.enrichRolesWithSectorTrack(roles);
          console.log('Enriched roles:', this.tenantAssignedRoles);
        } else {
          this.showError('Failed to load tenant roles');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.showError('Error loading tenant roles');
        console.error('Error:', err);
      }
    });
  }

  // Enrich roles with sector/track info from SSF data and normalize field names
  private enrichRolesWithSectorTrack(roles: any[]): IJobRole[] {
    return roles.map(role => {
      // Normalize field names - API returns jobRole, sector, track
      // But our interface uses jobRoleName, sectorName, trackName
      const normalizedRole = {
        ...role,
        jobRoleName: role.jobRoleName || role.jobRole || '',
        sectorName: role.sectorName || role.sector || '',
        trackName: role.trackName || role.track || '',
        jobRoleDescription: role.jobRoleDescription || ''
      };

      // If still missing sector/track, look up from SSF data
      if (!normalizedRole.sectorName || !normalizedRole.trackName) {
        for (const sector of this.sectorData) {
          for (const track of sector.trackList || []) {
            const foundRole = (track.jobRoleList || []).find(
              (r: any) => r.jobRoleId === role.jobRoleId || r.jobRoleName === normalizedRole.jobRoleName
            );
            if (foundRole) {
              normalizedRole.sectorName = normalizedRole.sectorName || sector.sectorName;
              normalizedRole.trackName = normalizedRole.trackName || track.trackName;
              break;
            }
          }
          if (normalizedRole.sectorName && normalizedRole.trackName) break;
        }
      }

      return normalizedRole;
    });
  }

  // ============================================
  // MANAGE SKILLS: Skill Editing
  // ============================================
  onManageSkillsClick(role: any): void {
    console.log('Managing skills for role:', role);
    
    // API returns 'sector' and 'track' (not sectorName/trackName)
    // API returns 'jobRole' (not jobRoleName)
    const roleSector = role.sectorName || role.sector || '';
    const roleTrack = role.trackName || role.track || '';
    const roleName = role.jobRoleName || role.jobRole || '';
    
    // Set sector/track from role object
    if (roleSector) {
      this.selectedSector = roleSector;
      // Also update trackData for the sector
      const sector = this.sectorData.find(s => s.sectorName === roleSector);
      if (sector) {
        this.selectedSectorId = sector.sectorId.toString();
        this.trackData = sector.trackList || [];
      }
    }
    if (roleTrack) {
      this.selectedTrack = roleTrack;
      const track = this.trackData.find(t => t.trackName === roleTrack);
      if (track) {
        this.selectedTrackId = track.trackId.toString();
      }
    }

    // If sector/track still not set, try to find from SSF data
    if (!this.selectedSector || !this.selectedTrack) {
      console.log('Sector/Track not in role, searching SSF...');
      const found = this.findRoleInSSF(role.jobRoleId, roleName);
      if (found) {
        console.log('Found in SSF:', found);
        this.selectedSector = found.sectorName;
        this.selectedTrack = found.trackName;
        
        const sector = this.sectorData.find(s => s.sectorName === found.sectorName);
        if (sector) {
          this.selectedSectorId = sector.sectorId.toString();
          this.trackData = sector.trackList || [];
        }
      } else {
        console.log('Role not found in SSF data');
      }
    }
    
    console.log('Selected Sector:', this.selectedSector, 'Track:', this.selectedTrack);
    
    // Create a normalized role object with jobRoleName
    const normalizedRole = {
      ...role,
      jobRoleName: roleName,
      sectorName: roleSector,
      trackName: roleTrack
    };
    
    this.editSkills(normalizedRole);
  }

  // Find role in SSF data and return sector/track
  private findRoleInSSF(roleId: number, roleName: string): { sectorName: string; trackName: string } | null {
    for (const sector of this.sectorData) {
      for (const track of sector.trackList || []) {
        const foundRole = (track.jobRoleList || []).find(
          (r: any) => r.jobRoleId === roleId || r.jobRoleName === roleName
        );
        if (foundRole) {
          return {
            sectorName: sector.sectorName,
            trackName: track.trackName
          };
        }
      }
    }
    return null;
  }

  editSkills(role: IJobRole): void {
    this.clearMessages();
    this.selectedRole = role.jobRoleName;
    this.isEditingSkills = true;
    this.keyTaskList = [];
    this.groupedKeyData = [];
    this.coreSkills = [];
    this.tdcSkills = [];
    this.isLoading = true;

    const payload = {
      aspiredRole: this.selectedRole,
      aspiredTrack: this.selectedTrack,
      aspiredSector: this.selectedSector,
      currentRole: this.selectedRole,
      currentSector: this.selectedSector,
      currentTrack: this.selectedTrack,
      currentTenant: this.selectedTenantId
    };

    console.log('Loading skills with payload:', payload);

    this.skillService.getKeyTasks(payload).subscribe({
      next: (res) => {
        console.log('getKeyTasks response:', res);
        this.keyTaskList = res.result ?? [];
        
        if (this.keyTaskList.length === 0) {
          console.log('No key tasks found, creating default structure');
          this.createDefaultSkillStructure();
        } else {
          this.groupedKeyData = this.groupKeyTasks(this.keyTaskList);
          this.fetchSkillGapAnalysis();
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Failed to load skill data');
        console.error('API Error:', err);
      }
    });
  }

  private createDefaultSkillStructure(): void {
    // No skills found from SSF - create empty editable structure
    this.groupedKeyData = [{
      criticalWorkFunction: '',
      oldValue: '',
      isEdited: false,
      isEditing: true,
      tasks: [{
        keyTaskSkill: '',
        oldValue: '',
        isAlreadyCreated: false,
        isNew: true,
        isEdited: false
      }]
    }];

    this.coreSkills = [];
    this.tdcSkills = [];

    this.isCoreEditing = true;
    this.isTdcEditing = true;
    
    // Show info message
    this.showSuccess('No existing skills found. You can add skills manually or they will be populated from SSF.');
  }

  fetchSkillGapAnalysis(): void {
    const payload = {
      aspiredRole: this.selectedRole,
      aspiredTrack: this.selectedTrack,
      aspiredSector: this.selectedSector,
      currentRole: 'Select Role',
      currentSector: 'Select Sector',
      currentTrack: 'Select Track',
      currentTenant: this.selectedTenantId
    };

    console.log('Fetching skill gap analysis with payload:', payload);

    this.skillService.getSkillGapAnalysis(payload).subscribe({
      next: (res) => {
        console.log('Skill gap analysis response:', res);
        this.coreSkills = res.coreSkills || [];
        this.tdcSkills = res.tdcSkills || [];
      },
      error: (err) => {
        console.error('Error fetching skill gap analysis:', err);
      }
    });
  }

  private groupKeyTasks(list: KeyTask[]): GroupedKeyTask[] {
    if (!Array.isArray(list)) {
      return [];
    }

    const grouped = list.reduce((acc: Record<string, GroupedKeyTask>, item) => {
      const cwf = item.criticalWorkFunction || 'Uncategorized';
      
      if (!acc[cwf]) {
        acc[cwf] = {
          criticalWorkFunction: cwf,
          oldValue: cwf,
          isEdited: false,
          isEditing: false,
          tasks: []
        };
      }
      
      acc[cwf].tasks.push({
        keyTaskSkill: item.keyTaskSkill,
        oldValue: item.keyTaskSkill,
        isAlreadyCreated: item.isAlreadyCreated,
        isNew: false,
        isEdited: false
      });
      
      return acc;
    }, {});

    return Object.values(grouped);
  }

  exitEditMode(): void {
    this.isEditingSkills = false;
    this.groupedKeyData = [];
    this.coreSkills = [];
    this.tdcSkills = [];
    this.selectedRole = '';
    this.isCoreEditing = false;
    this.isTdcEditing = false;
    this.clearMessages();
  }

  // ============================================
  // EDIT TOGGLES
  // ============================================
  toggleEdit(taskGroup: GroupedKeyTask): void {
    taskGroup.isEditing = !taskGroup.isEditing;
  }

  toggleCoreEdit(): void {
    this.isCoreEditing = !this.isCoreEditing;
  }

  toggleTdcEdit(): void {
    this.isTdcEditing = !this.isTdcEditing;
  }

  // ============================================
  // ADD/REMOVE OPERATIONS
  // ============================================
  addTask(taskGroup: GroupedKeyTask): void {
    if (!taskGroup.tasks) taskGroup.tasks = [];
    taskGroup.tasks.push({
      keyTaskSkill: 'New Key Task',
      oldValue: '',
      isNew: true,
      isEdited: false,
      isAlreadyCreated: false
    });
  }

  removeTask(taskGroup: GroupedKeyTask, index: number): void {
    taskGroup.tasks.splice(index, 1);
  }

  addCWFKeyTask(): void {
    this.groupedKeyData.push({
      criticalWorkFunction: 'Critical Work Function',
      oldValue: '',
      isEdited: true,
      isEditing: true,
      tasks: [{
        keyTaskSkill: 'Key Task Skill',
        oldValue: '',
        isAlreadyCreated: false,
        isNew: true,
        isEdited: true
      }]
    });

    setTimeout(() => this.triggerButtonClick(), 20);
  }

  addCoreSkill(): void {
    this.coreSkills.push({
      coreSkill: 'New Core Skill',
      proficiencyLevel: '1',
      isNew: true,
      isEdited: false
    });
  }

  removeCoreSkill(skill: CoreSkillGap): void {
    this.coreSkills = this.coreSkills.filter(s => s !== skill);
  }

  addTdcSkill(): void {
    this.tdcSkills.push({
      tdcSkill: 'New TDC Skill',
      tdcProficiencyLevel: 'Basic',
      isNew: true,
      isEdited: false
    });
  }

  removeTdcSkill(skill: TdcSkillGap): void {
    this.tdcSkills = this.tdcSkills.filter(s => s !== skill);
  }

  // ============================================
  // CHANGE HANDLERS
  // ============================================
  onCwfChange(group: GroupedKeyTask, event: Event): void {
    const newValue = (event.target as HTMLElement).textContent?.trim() || '';
    if (group.criticalWorkFunction !== newValue) {
      if (!group.isEdited) group.oldValue = group.criticalWorkFunction;
      group.criticalWorkFunction = newValue;
      group.isEdited = true;
    }
  }

  onKeyTaskEdit(task: KeyTask, event: Event): void {
    const newValue = (event.target as HTMLElement).textContent?.trim() || '';
    
    if (task.isNew) {
      task.keyTaskSkill = newValue;
    } else if (task.keyTaskSkill !== newValue) {
      if (!task.isEdited) task.oldValue = task.keyTaskSkill;
      task.keyTaskSkill = newValue;
      task.isEdited = true;
    }
  }

  onCoreSkillChange(skill: CoreSkillGap, event: Event): void {
    const newValue = (event.target as HTMLElement).textContent?.trim() || '';
    if (skill.coreSkill !== newValue) {
      if (!skill.isEdited) skill.oldValue = skill.coreSkill;
      skill.coreSkill = newValue;
      skill.isEdited = true;
    }
  }

  onTdcSkillChange(skill: TdcSkillGap, event: Event): void {
    const newValue = (event.target as HTMLElement).textContent?.trim() || '';
    if (skill.tdcSkill !== newValue) {
      if (!skill.isEdited) skill.oldValue = skill.tdcSkill;
      skill.tdcSkill = newValue;
      skill.isEdited = true;
    }
  }

  onCoreProficiencyChange(skill: CoreSkillGap): void {
    skill.isEdited = true;
  }

  onTdcProficiencyChange(skill: TdcSkillGap): void {
    skill.isEdited = true;
  }

  // ============================================
  // SAVE CHANGES
  // ============================================
  onSubmitKeyTaskChanges(): void {
    this.isSaving = true;
    this.clearMessages();

    const changedKeyTasks = this.groupedKeyData
      .map(group => {
        const changedTasks = group.tasks.filter(t => t.isNew || t.isEdited);
        if (group.isEdited || changedTasks.length > 0) {
          return {
            criticalWorkFunction: group.criticalWorkFunction,
            oldValue: group.oldValue ?? null,
            isEdited: !!group.isEdited,
            tasks: changedTasks.map(t => ({
              keyTaskSkill: t.keyTaskSkill,
              oldValue: t.oldValue ?? null,
              isNew: t.isNew ?? false,
              isEdited: t.isEdited ?? false
            }))
          };
        }
        return null;
      })
      .filter((group): group is NonNullable<typeof group> => group !== null);

    const changedCoreSkills = this.coreSkills
      .filter(s => s.isNew || s.isEdited)
      .map(s => ({
        coreSkill: s.coreSkill,
        oldValue: s.oldValue ?? null,
        proficiencyLevel: s.proficiencyLevel,
        isNew: s.isNew ?? false,
        isEdited: s.isEdited ?? false
      }));

    const changedTdcSkills = this.tdcSkills
      .filter(s => s.isNew || s.isEdited)
      .map(s => ({
        tdcSkill: s.tdcSkill,
        oldValue: s.oldValue ?? null,
        tdcProficiencyLevel: s.tdcProficiencyLevel,
        isNew: s.isNew ?? false,
        isEdited: s.isEdited ?? false
      }));

    const payload = {
      tenantInfo: {
        selectedTenant: this.selectedTenantId,
        selectedSector: this.selectedSector,
        selectedTrack: this.selectedTrack,
        selectedRole: this.selectedRole
      },
      keyTasks: changedKeyTasks,
      coreSkills: changedCoreSkills,
      tdcSkills: changedTdcSkills
    };

    this.skillService.updateSkills(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSuccess('Skills saved successfully!');
        this.resetEditFlags();
        
        // Refresh data
        this.editSkills({ jobRoleName: this.selectedRole } as IJobRole);
      },
      error: (err) => {
        this.isSaving = false;
        this.showError('Failed to save changes. Please try again.');
        console.error('Update failed:', err);
      }
    });
  }

  private resetEditFlags(): void {
    this.groupedKeyData.forEach(group => {
      group.isEdited = false;
      group.isEditing = false;
      group.tasks.forEach(task => {
        task.isNew = false;
        task.isEdited = false;
      });
    });

    this.coreSkills.forEach(skill => {
      skill.isNew = false;
      skill.isEdited = false;
    });

    this.tdcSkills.forEach(skill => {
      skill.isNew = false;
      skill.isEdited = false;
    });

    this.isCoreEditing = false;
    this.isTdcEditing = false;
  }

  // ============================================
  // CUSTOM ROLES HANDLERS (from child component)
  // ============================================
  onRoleAdded(newRoleData: any): void {
    this.selectedRole = newRoleData.roleName;
    this.selectedTenant = this.tenantlist.find(
      t => t.tenantId.toString() === newRoleData.tenantId
    )?.tenantName || '';

    this.selectedTenantId = newRoleData.tenantId.toString();
    this.selectedSector = newRoleData.sectorName;
    this.selectedTrack = newRoleData.trackName;
    
    // Reload custom roles list
    this.loadCustomRoles();
    
    // Switch to Manage Skills tab and edit the new role
    this.setActiveTab('manage-skills');
    this.getSectorDataForSelection(newRoleData.sectorName, newRoleData.trackName);
    this.editSkills({ jobRoleName: newRoleData.roleName } as IJobRole);
    
    setTimeout(() => this.triggerButtonClick(), 200);

    this.isTdcEditing = true;
    this.isCoreEditing = true;
    this.showSuccess('Role added successfully! Now configure the skills.');
  }

  onChildCancelled(): void {
    // Stay on current tab
  }

  loadCustomRoles(): void {
    if (!this.selectedTenantId) {
      this.showError('Please select a tenant first');
      return;
    }

    this.isLoading = true;
    this.customRolesList = [];

    const request = {
      sector: this.selectedSector || '',
      track: this.selectedTrack || '',
      tenantId: this.selectedTenantId
    };

    this.skillService.getTenantJobRoles(request).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.statusCode === 200) {
          // Filter only custom roles (addedByUser === 1)
          const allRoles = res.result || [];
          this.customRolesList = allRoles.filter((role: any) => role.addedByUser === 1);
        } else {
          this.showError('Failed to load custom roles');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.showError('Error loading custom roles');
        console.error('Error:', err);
      }
    });
  }

  editCustomRole(role: any): void {
    // Switch to Manage Skills tab and edit the role
    this.selectedRole = role.jobRoleName;
    this.setActiveTab('manage-skills');
    this.editSkills(role);
  }

  deleteCustomRole(role: any): void {
    if (!confirm(`Are you sure you want to delete "${role.jobRoleName}"?`)) {
      return;
    }

    this.skillService.deleteSectorTrackRole(role.jobRoleId).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200 || !res.isError) {
          this.showSuccess(`"${role.jobRoleName}" deleted successfully`);
          this.loadCustomRoles();
        } else {
          this.showError('Failed to delete role');
        }
      },
      error: (err: any) => {
        this.showError('Error deleting role');
        console.error('Error:', err);
      }
    });
  }

  private getSectorDataForSelection(sectorName: string, trackName: string): void {
    this.skillService.getSectorsTracksJobRoles(0, 0).subscribe({
      next: (res: ApiResponse<SectorApiResult>) => {
        if (!res.isError && res.statusCode === 200 && res.result?.data) {
          this.sectorData = res.result.data;
          Promise.resolve().then(() => {
            this.preselectSectorAndTrack(sectorName, trackName);
          });
        }
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  private preselectSectorAndTrack(sectorName: string, trackName: string): void {
    this.selectedSector = sectorName;
    const sector = this.sectorData.find(s => s.sectorName === sectorName);
    if (sector) {
      this.selectedSectorId = sector.sectorId.toString();
      this.trackData = sector.trackList;
      Promise.resolve().then(() => {
        this.selectedTrack = trackName || '';
        const track = this.trackData.find(t => t.trackName === trackName);
        if (track) {
          this.selectedTrackId = track.trackId.toString();
        }
      });
    }
  }

  // ============================================
  // UTILITIES
  // ============================================
  onResetAll(): void {
    this.clearMessages();
    this.resetFilters();
    this.groupedKeyData = [];
    this.coreSkills = [];
    this.tdcSkills = [];
    this.selectedRole = '';
    this.isDropdownDisabled = false;
    this.isCoreEditing = false;
    this.isTdcEditing = false;
    this.isEditingSkills = false;
    this.tenantAssignedRoles = [];
    this.customRolesList = [];
    this.activeTab = 'browse-roles';
    
    this.getSectorData();
  }

  private triggerButtonClick(): void {
    setTimeout(() => {
      const buttons = this.editButtons.toArray();
      const lastButton = buttons[buttons.length - 1];
      if (lastButton) {
        lastButton.nativeElement.click();
      }
    });
  }

  private handleApiError(error: any, context: string): void {
    let message = `Error ${context}`;
    
    if (error.error?.responseException?.customErrors) {
      const errors = error.error.responseException.customErrors;
      if (Array.isArray(errors)) {
        message = errors.map((e: any) => e.reason).join('. ');
      }
    }
    
    this.showError(message);
    console.error(`Error ${context}:`, error);
  }
}
