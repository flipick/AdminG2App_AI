import { Component, OnInit, NgModule, ViewChild, ElementRef, viewChild, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SkillService } from '../../services/skill-services';
import { TenantService } from '../../services/tenant-service';
import { CoreSkillGap, IJobRole, IJobSector, IJobTrack, KeyTask, SectorRequest, TdcSkillGap, GroupedKeyTask } from '../../model/skill';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../services/permission-service';
import { getTenantId } from '../../services/utility';
import { AddSectorTrackRole } from './add-sector-track-role/add-sector-track-role';


// ✅ Generic API Response type
interface ApiResponse<T> {
  isError: boolean;
  statusCode: number;
  result?: T;
  message?: string;
}

// ✅ Matches your API's "result" structure
interface SectorApiResult {
  data: IJobSector[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalRecordsText: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, AddSectorTrackRole],
  templateUrl: './skills.html',
  styleUrls: ['./skills.css']
})
export class Skills implements OnInit {
  @ViewChild('trackSelect') trackSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('sectorSelect') sectorSelect!: ElementRef<HTMLSelectElement>;
  @ViewChildren('editBtn') editButtons!: QueryList<ElementRef>;

  errorMessage: string = '';
  sectorData: IJobSector[] = [];
  trackData: IJobTrack[] = [];
  roleData: IJobRole[] = [];

  keyTaskList: KeyTask[] = [];

  selectedTenant: string = "";
  selectedSector: string = "";
  selectedTrack: string = "";
  selectedRole: string = "";

  groupedKeyData: any[] = [];
  coreSkills: CoreSkillGap[] = [];
  tdcSkills: TdcSkillGap[] = [];
  tenantJobRoles: any[] = [];
  isCoreEditing = false;
  isTdcEditing = false;

  // Initially dropdowns are enabled
  isDropdownDisabled: boolean = false;

  selectedIds = new Set<string>();

  tenantlist: any[] = []; // tenants from API
  selectedTenantId: string | '' = ''; // two-way binding selected value
  permissions: any;

  showSkillSettings = false;

  constructor(private router: Router, private skillService: SkillService, private tenantService: TenantService, private permissionService: PermissionService) { }

  ngOnInit(): void {
    this.loadTenant();
    this.getSectorData();
    this.selectedTenantId = getTenantId() || '';
    this.permissions = this.permissionService.getPermission('SkillFramework');
  }

  get hasSelection(): boolean {
    return this.selectedIds.size > 0;
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success && res.result) {
          this.tenantlist = res.result;
        }
      },
      error: (err: any) => {
        console.error('Error fetching tenants:', err);
      }
    });
  }

  onTenantChange(event: any) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    this.selectedTenantId = event.target.value;
    this.selectedTenant = selectedOption.getAttribute('data-name');
    if (this.trackSelect?.nativeElement) {
      this.trackSelect.nativeElement.value = '';
    }
    if (this.sectorSelect?.nativeElement) {
      this.sectorSelect.nativeElement.value = '';
    }
    this.selectedSector = '';
    this.selectedTrack = '';
    this.roleData = [];
    this.selectedIds.clear();
  }

  getSectorData(): void {
    const pageIndex = 0;
    const pageSize = 0;

    this.skillService.getSectorsTracksJobRoles(pageIndex, pageSize).subscribe({
      next: (res: ApiResponse<SectorApiResult>) => {
        if (!res.isError && res.statusCode === 200 && res.result?.data) {
          this.sectorData = res.result.data;
        } else {
          this.errorMessage = 'Failed to fetch sector data';
        }
      },
      error: (error) => {
        this.errorMessage = '';
        if (
          error.error?.responseException?.customErrors &&
          Array.isArray(error.error.responseException.customErrors)
        ) {
          for (let key of error.error.responseException.customErrors) {
            this.errorMessage += key.reason + '\n';
          }
        } else {
          this.errorMessage = 'An unexpected error occurred';
        }
      }
    });
  }

  onSectorChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedText = selectElement.options[selectElement.selectedIndex].text;
    this.selectedSector = selectedText;
    var fltSector: IJobSector[] = this.sectorData.filter((x: IJobSector) => x.sectorName == selectedText);

    this.selectedTrack = '';
    this.trackData = [];
    if (fltSector.length) {
      this.trackData = fltSector[0].trackList;
    }
    else {
      this.trackData = [];
    }
    if (this.trackSelect?.nativeElement) {
      this.trackSelect.nativeElement.value = '';
    }
  }

  onTrackChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedText = selectElement.options[selectElement.selectedIndex].text;
    this.selectedTrack = selectedText;
  }

  onApplyFilter() {
    // reset first
    this.keyTaskList = [];
    this.groupedKeyData = [];

    if (this.trackData.length) {
      var fltTrack = this.trackData.filter((x: IJobTrack) => x.trackName == this.selectedTrack);
      if (fltTrack.length) {
        this.roleData = fltTrack[0].jobRoleList.map(roles => ({
          ...roles,
          isChecked: false   // initialize
        }));
        this.getTenantJobRoles();
      }
      else {
        this.roleData = [];
      }
    }
  }

  editSkills(roles: { jobRoleName: string }) {
    this.selectedRole = roles.jobRoleName;
    this.keyTaskList = [];
    this.groupedKeyData = [];
    this.coreSkills = [];
    this.tdcSkills = [];

    const payload = {
      aspiredRole: this.selectedRole,
      aspiredTrack: this.selectedTrack,
      aspiredSector: this.selectedSector,
      currentRole: this.selectedRole,
      currentSector: this.selectedSector,
      currentTrack: this.selectedTrack,
      currentTenant: this.selectedTenantId
    };

    this.skillService.getKeyTasks(payload).subscribe({
      next: (res) => {
        this.keyTaskList = res.result ?? [];  // ✅ no error now
        if (this.keyTaskList.length == 0) {
          this.groupedKeyData.push({
            criticalWorkFunction: 'Critical Work Function',
            oldValue: '',
            isEdited: true,
            tasks: [
              {
                keyTaskSkill: 'Key Task Skill',
                oldValue: '',
                isAlreadyCreated: false,
                isNew: true,
                isEdited: true
              }
            ]
          });

          this.coreSkills.push({
            coreSkill: 'New Core Skill',
            proficiencyLevel: '1',
            isEdited: true,
            isNew: true
          });

          this.tdcSkills.push({
            tdcSkill: 'New TDC Skill',
            tdcProficiencyLevel: 'Basic',
            isNew: true,
            isEdited: true
          });
        }
        else {
          this.groupedKeyData = this.groupKeyTasks(this.keyTaskList);
          this.fetchSkillGapAnalysis();
        }
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
  }

  // skills.component.ts
  fetchSkillGapAnalysis(): void {
    const payload = {
      aspiredRole: this.selectedRole,
      aspiredTrack: this.selectedTrack,
      aspiredSector: this.selectedSector,
      currentRole: "Select Role",
      currentSector: "Select Sector",
      currentTrack: "Select Track",
      currentTenant: this.selectedTenantId
    };

    this.skillService.getSkillGapAnalysis(payload).subscribe({
      next: (res) => {
        this.coreSkills = res.coreSkills;
        this.tdcSkills = res.tdcSkills;
      },
      error: (err) => {
        console.error('Error fetching skill gap analysis', err);
      }
    });
  }

  private groupKeyTasks(list: any[]): GroupedKeyTask[] {
    if (!Array.isArray(list)) {
      console.warn("Expected an array but got:", list);
      return [];
    }

    return Object.values(
      list.reduce((acc: any, item: any) => {
        if (!acc[item.criticalWorkFunction]) {
          acc[item.criticalWorkFunction] = {
            criticalWorkFunction: item.criticalWorkFunction,
            oldValue: item.criticalWorkFunction,   // ✅ track original CWF
            isEdited: false,
            tasks: []
          };
        }
        acc[item.criticalWorkFunction].tasks.push({
          keyTaskSkill: item.keyTaskSkill,
          oldValue: item.keyTaskSkill,            // ✅ track original value
          isAlreadyCreated: item.isAlreadyCreated,
          isNew: false,
          isEdited: false
        });
        return acc;
      }, {})
    );
  }


  onCheckboxChange(event: Event, role: any) {
    const checkbox = event.target as HTMLInputElement;
    const roleId = role.jobRoleId.toString();   // force string

    if (checkbox.checked) {
      this.selectedIds.add(roleId);
    } else {
      this.selectedIds.delete(roleId);
    }
  }

  onAssignToTenant() {
    const payload = {
      SelectedTrack: this.selectedTrack,
      SelectedSector: this.selectedSector,
      SelectedTenant: this.selectedTenantId,
      SelectedRoleId: Array.from(this.selectedIds) // 🔑 convert to array
    };


    this.skillService.assignRolesToTenant(payload).subscribe({
      next: (response) => {
        this.onApplyFilter(); // Refresh the list
      },
      error: (err) => {
        console.log('❌ Assign failed:', err);
      }
    });
  }

  getTenantJobRoles() {
    const request = {
      sector: this.selectedSector,
      track: this.selectedTrack,
      tenantId: this.selectedTenantId
    };

    this.skillService.getTenantJobRoles(request).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.tenantJobRoles = res.result;

          // clear old selections before re-adding
          this.selectedIds.clear();

          // Compare with existing roleData and sync selectedIds
          this.roleData = this.roleData.map(roles => {
            const isSelected = this.tenantJobRoles.some(
              (t: any) => t.jobRoleId === roles.jobRoleId
            );

            if (isSelected) {
              this.selectedIds.add(roles.jobRoleId.toString());
            }

            return {
              ...roles,
              isChecked: isSelected,
              isCheckedAsignToTenant: isSelected
            };
          });

        } else {
          console.log(res.message);
        }
      },
      error: (err: any) => {
        console.error('Error fetching job roles:', err);
      }
    });
  }


  toggleEdit(taskGroup: any) {
    taskGroup.isEditing = !taskGroup.isEditing;
  }


  addTask(taskGroup: any) {
    if (!taskGroup.tasks) taskGroup.tasks = [];
    taskGroup.tasks.push({
      keyTaskSkill: 'New Key Task',
      isNew: true
    });
  }

  addCWFKeyTask() {
    this.groupedKeyData.push({
      criticalWorkFunction: 'Critical Work Function',
      oldValue: '',
      isEdited: true,
      tasks: [
        {
          keyTaskSkill: 'Key Task Skill',
          oldValue: '',
          isAlreadyCreated: false,
          isNew: true,
          isEdited: true
        }
      ]
    });

    setTimeout(() => {
      this.triggerButtonClick();
    }, 20);
  }

  removeTask(taskGroup: any, index: number) {
    taskGroup.tasks.splice(index, 1);
  }

  toggleCoreEdit() {
    this.isCoreEditing = !this.isCoreEditing;
  }

  addCoreSkill() {
    this.coreSkills.push({
      coreSkill: 'New Core Skill',
      proficiencyLevel: '1',
      isNew: true
    });
  }

  removeCoreSkill(skill: any) {
    this.coreSkills = this.coreSkills.filter(s => s !== skill);
  }

  toggleTdcEdit() {
    this.isTdcEditing = !this.isTdcEditing;
  }

  addTdcSkill() {
    this.tdcSkills.push({
      tdcSkill: 'New TDC Skill',
      tdcProficiencyLevel: 'Basic',
      isNew: true,
      isEdited: false
    });
  }

  removeTdcSkill(skill: any) {
    this.tdcSkills = this.tdcSkills.filter(s => s !== skill);
  }

  onCwfChange(group: GroupedKeyTask, event: Event) {
    const newValue = (event.target as HTMLElement).textContent?.trim() || '';
    if (group.criticalWorkFunction !== newValue) {
      if (!group.isEdited) group.oldValue = group.criticalWorkFunction;  // ✅ store old
      group.criticalWorkFunction = newValue;
      group.isEdited = true;
    }
  }

  // Key Task
  onKeyTaskEdit(task: KeyTask, event: Event) {
    const target = event.target as HTMLElement;
    const newValue = target.textContent?.trim() || '';

    if (task.isNew) {
      // For new tasks: always update the skill
      task.keyTaskSkill = newValue;
    } else {
      // For existing tasks: update + track old value
      if (task.keyTaskSkill !== newValue) {
        if (!task.isEdited) task.oldValue = task.keyTaskSkill;   // ✅ store old
        task.keyTaskSkill = newValue;
        task.isEdited = true;
      }
    }
  }

  onCoreSkillChange(skill: CoreSkillGap, event: Event) {
    const el = event.target as HTMLElement;
    const newValue = el.textContent?.trim() || '';
    if (skill.coreSkill !== newValue) {
      if (!skill.isEdited) skill.oldValue = skill.coreSkill;   // ✅ store old
      skill.coreSkill = newValue;
      skill.isEdited = true;
    }
  }

  onTdcSkillChange(skill: TdcSkillGap, event: Event) {
    const el = event.target as HTMLElement;
    const newValue = el.textContent?.trim() || '';
    if (skill.tdcSkill !== newValue) {
      if (!skill.isEdited) skill.oldValue = skill.tdcSkill;   // ✅ store old
      skill.tdcSkill = newValue;
      skill.isEdited = true;
    }
  }

  onTdcProficiencyChange(skill: TdcSkillGap) {
    skill.isEdited = true;   // ✅ mark edited when proficiency changes
  }

  onCoreProficiencyChange(skill: CoreSkillGap) {
    skill.isEdited = true;   // ✅ mark edited when proficiency changes
  }

  onSubmitKeyTaskChanges(): void {
    const changedKeyTasks = this.groupedKeyData
      .map((group: GroupedKeyTask) => {
        const changedTasks = group.tasks.filter((t: KeyTask) => t.isNew || t.isEdited);
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
        } else {
          return null;
        }
      })
      .filter((group): group is any => group !== null);

    const changedCoreSkills = this.coreSkills
      .filter((s: CoreSkillGap) => s.isNew || s.isEdited)
      .map(s => ({
        coreSkill: s.coreSkill,
        oldValue: s.oldValue ?? null,
        proficiencyLevel: s.proficiencyLevel,
        isNew: s.isNew ?? false,
        isEdited: s.isEdited ?? false
      }));

    const changedTdcSkills = this.tdcSkills
      .filter((s: TdcSkillGap) => s.isNew || s.isEdited)
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
      next: (res) => {
        this.resetFlags();
        this.groupedKeyData.forEach(group => group.isEditing = false);
        this.isCoreEditing = false;
        this.isTdcEditing = false;

        // Refresh data
        this.editSkills({ jobRoleName: this.selectedRole });
        this.isDropdownDisabled = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
      }
    });
  }


  resetFlags(): void {
    // Reset Key Tasks
    this.groupedKeyData.forEach((group: GroupedKeyTask & { isEdited?: boolean }) => {
      group.isEdited = false; // reset CWF edit flag
      group.tasks.forEach((task: KeyTask) => {
        task.isNew = false;
        task.isEdited = false;
      });
    });

    // Reset Core Skills
    this.coreSkills.forEach((skill: CoreSkillGap) => {
      skill.isNew = false;
      skill.isEdited = false;
    });

    // Reset TDC Skills
    this.tdcSkills.forEach((skill: TdcSkillGap) => {
      skill.isNew = false;
      skill.isEdited = false;
    });
  }

  toggleSkillSettings() {
    this.showSkillSettings = !this.showSkillSettings;
  }


  // Called when child component emits 'added'
  onRoleAdded(newRoleData: any) {
    this.selectedRole = newRoleData.roleName;
    this.selectedTenant = this.tenantlist.find(
      t => t.tenantId.toString() === newRoleData.tenantId
    )?.tenantName || '';

    this.selectedTenantId = newRoleData.tenantId.toString();
    this.selectedSector = newRoleData.sectorName;
    this.selectedTrack = newRoleData.trackName;
    // ✅ Use new function to pre-select sector & track
    this.getSectorDataForSelection(newRoleData.sectorName, newRoleData.trackName);
    this.editSkills({ jobRoleName: newRoleData.roleName });
    this.showSkillSettings = false;
    this.isDropdownDisabled = true;
    setTimeout(() => {
      this.triggerButtonClick();
    }, 200);

    this.isTdcEditing = true;
    this.isCoreEditing = true;
  }

  triggerButtonClick() {
    // Wait for Angular to render the new element before clicking Edit
    setTimeout(() => {
      const buttons = this.editButtons.toArray();
      const lastButton = buttons[buttons.length - 1];
      if (lastButton) {
        lastButton.nativeElement.click(); // simulate edit click
      }
    });
  }

  getSectorDataForSelection(sectorName?: string, trackName?: string): void {
    const pageIndex = 0;
    const pageSize = 0;

    this.skillService.getSectorsTracksJobRoles(pageIndex, pageSize).subscribe({
      next: (res: ApiResponse<SectorApiResult>) => {
        if (!res.isError && res.statusCode === 200 && res.result?.data) {
          this.sectorData = res.result.data;

          // ✅ Wait until Angular renders the dropdowns
          // 👇 Delay preselect only until sector list is ready
          Promise.resolve().then(() => {
            this.preselectSectorAndTrack(this.selectedSector, this.selectedTrack);
          });
        } else {
          this.errorMessage = 'Failed to fetch sector data';
        }
      },
      error: (error) => {
        this.errorMessage = 'An unexpected error occurred';
        console.error(error);
      }
    });
  }

  preselectSectorAndTrack(sectorName: string, trackName: string) {
    this.selectedSector = sectorName;
    const sector = this.sectorData.find(s => s.sectorName === sectorName);
    if (sector) {
      this.trackData = sector.trackList;
      Promise.resolve().then(() => {
        this.selectedTrack = trackName || '';
      });
    }
  }

  // Called when child component emits 'cancelled'
  onChildCancelled() {
    this.showSkillSettings = false;
    this.isDropdownDisabled = false;
  }

  onRestAllSelection() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

}
