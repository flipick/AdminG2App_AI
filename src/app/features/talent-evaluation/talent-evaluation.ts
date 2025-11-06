import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITenant } from '../../model/tenant';
import { TenantService } from '../../services/tenant-service';
import { getTenantId } from '../../services/utility';
import { FilterDetails } from '../../model/table';
import { LearnerService } from '../../services/learner-service';
import { CoreSkillGap, GroupedKeyTask, KeyTask, TdcSkillGap } from '../../model/skill';
import { TalentEvaluationService } from '../../services/talentevaluation-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-talent-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './talent-evaluation.html',
  styleUrls: ['./talent-evaluation.css']
})


export class TalentEvaluation {

  tenantlist: ITenant[] = [];
  learners: any[] = [];

  selectedTenantId: string = '';
  selectedLearnerId: string = '';

  showErrors: boolean = false;
  tenantTouched: boolean = false;
  learnerTouched: boolean = false;

  payload = { pageIndex: 0, pageSize: 10, filter: [] as FilterDetails[] };

  groupedKeyData: any[] = [];
  coreSkills: CoreSkillGap[] = [];
  tdcSkills: TdcSkillGap[] = [];
  keyTaskList: KeyTask[] = [];
  isCoreEditing = false;
  isTdcEditing = false;
  permissions: any;

  constructor(
    private tenantService: TenantService,
    private learnerService: LearnerService,
    private talentEvolutionService: TalentEvaluationService,
    private permissionService: PermissionService
  ) {
    this.loadTenant();
  }

  ngOnInit(): void {
      this.permissions = this.permissionService.getPermission('SkillFramework');
    }

  // ===========================
  // Section: Header Dropdown 
  // ===========================

  onApplyFilter() {
    this.showErrors = true;
    this.tenantTouched = true;
    this.learnerTouched = true;
    if (!this.selectedTenantId || !this.selectedLearnerId) {
      return;
    }
    if (this.selectedTenantId != "" && this.selectedLearnerId != "") {
      this.editSkillsByEmployee();
    }
  }

  filterByTenant(tenantId: string) {
    this.tenantTouched = true;
    this.selectedTenantId = tenantId;

    // ✅ Reset employee selection
    this.selectedLearnerId = '';
    this.learnerTouched = false;

    this.fillFilterObject();
  }

  filterByLearner(learnerId: string) {
    this.learnerTouched = true;
    this.selectedLearnerId = learnerId;
  }

  resetAllData(): void {
    this.groupedKeyData = [];
    this.coreSkills = [];
    this.tdcSkills = [];
    this.keyTaskList = [];
    this.isCoreEditing = false;
    this.isTdcEditing = false;
  }

  onTenantChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedTenantId = select.value;
    this.filterByTenant(select.value);
    this.resetAllData();   // ✅ clear everything
  }

  onLearnerChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedLearnerId = select.value;
    this.filterByLearner(select.value);
     this.resetAllData();   // ✅ clear everything
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = getTenantId(); // Optional default
          this.fillFilterObject();
        }
      },
      error: (err: any) => {
        console.error('Error fetching tenants:', err);
      }
    });
  }

  fillFilterObject() {
    const index = this.payload.filter.findIndex(
      (obj: FilterDetails) => obj.colId?.toLowerCase() === 'tenantid'
    );

    if (index > -1) {
      this.payload.filter[index].value = this.selectedTenantId;
    } else {
      const objFilter = new FilterDetails();
      objFilter.colId = 'tenantid';
      objFilter.name = 'tenantid';
      objFilter.value = this.selectedTenantId;
      objFilter.type = 'cs';
      this.payload.filter.push(objFilter);
    }

    this.loadLearners(this.payload);
  }

  loadLearners(payload: any): void {
    this.payload.pageIndex = 1;
    this.payload.pageSize = 10;

    this.learnerService.getAllLearners(payload).subscribe((res: any) => {
      if (res.success) {
        this.learners = res.result.data;
      }
    });
  }

  // ===========================
  // Section: Role Management
  // ===========================

  toggleEdit(taskGroup: any) {
    taskGroup.isEditing = !taskGroup.isEditing;
  }
  addTask(taskGroup: any) {
    if (!taskGroup.tasks) taskGroup.tasks = [];
    taskGroup.tasks.push({
      keyTaskSkill: 'New Key Task',
      oldValue : 'New Key Task',
      isNew: true
    });
  }

  // removeTask(taskGroup: any, index: number) {
  //   taskGroup.tasks.splice(index, 1);
  // }

  removeTask(taskGroup: any, index: number) {
  const task = taskGroup.tasks[index];
  const employeeId = Number(this.selectedLearnerId);

  if (task.isNew) {
    // Not yet in DB → just remove locally
    taskGroup.tasks.splice(index, 1);
    return;
  }

  this.talentEvolutionService.deleteEmployeeKeyTaskByName(employeeId, task.keyTaskSkill)
    .subscribe({
      next: () => {
        taskGroup.tasks.splice(index, 1); // ✅ remove locally after DB success
      },
      error: (err) => {
        console.error('Error deleting key task:', err);
      }
    });
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
  const employeeId = Number(this.selectedLearnerId);

  if (skill.isNew) {
    // Not saved in DB → just remove from UI
    this.coreSkills = this.coreSkills.filter(s => s !== skill);
    return;
  }

  this.talentEvolutionService.deleteEmployeeCoreSkillByName(employeeId, skill.coreSkill)
    .subscribe({
      next: () => {
        // ✅ remove locally after DB delete succeeds
        this.coreSkills = this.coreSkills.filter(s => s !== skill);
      },
      error: (err) => {
        console.error('Error deleting core skill:', err);
      }
    });
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
    const employeeId = Number(this.selectedLearnerId);

    if (skill.isNew) {
      // ✅ Not saved in DB → remove only from UI
      this.tdcSkills = this.tdcSkills.filter(s => s !== skill);
      return;
    }

    this.talentEvolutionService
      .deleteEmployeeTdcSkillByName(employeeId, skill.tdcSkill)
      .subscribe({
        next: () => {
          // ✅ Remove locally after DB delete succeeds
          this.tdcSkills = this.tdcSkills.filter(s => s !== skill);
        },
        error: (err) => {
          console.error('Error deleting TDC skill:', err);
        }
      });
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

  editSkillsByEmployee(): void {
    // Reset state
    this.keyTaskList = [];
    this.groupedKeyData = [];
    this.coreSkills = [];
    this.tdcSkills = [];

    const employeeId = Number(this.selectedLearnerId);
    if (!employeeId) {
      console.warn('Employee ID is missing or invalid.');
      return;
    }

    // Step 1: Call stored procedure to copy data
    this.talentEvolutionService.copyEmployeeSkills(employeeId).subscribe({
      next: (res) => {
        console.log(res.message);

        // Step 2: Fetch Key Tasks for employee after copy
        this.talentEvolutionService.getKeyTasksByEmployee(employeeId).subscribe({
          next: (res2) => {
            this.keyTaskList = res2.result ?? [];
            this.groupedKeyData = this.groupKeyTasks(this.keyTaskList);
            this.fetchSkillGapAnalysis();
          },
          error: (err2) => {
            console.error("Error fetching skills by employee:", err2);
          }
        });
      },
      error: (err) => {
        console.error("Error copying employee skills:", err);
      }
    });
  }


  fetchSkillGapAnalysis(): void {
    const employeeId = Number(this.selectedLearnerId);
    if (!employeeId) {
      console.warn('Employee ID is missing or invalid.');
      return;
    }

    this.talentEvolutionService.getSkillGapAnalysisByEmployee(employeeId).subscribe({
      next: (res) => {
        const allSkills: any[] = res.result; // or res.result if wrapped in a response object
        this.coreSkills = allSkills
          .filter((skill: any) => skill.coreSkill !== null && skill.coreSkill !== undefined)
          .map((skill: any): CoreSkillGap => ({
            coreSkill: skill.coreSkill,
            proficiencyLevel: skill.proficiencyLevel,
            oldValue: skill.oldValue ?? null,
            isNew: skill.isNew ?? false,
            isEdited: skill.isEdited ?? false
          }));

        this.tdcSkills = allSkills
          .filter((skill: any) => skill.tdcSkill !== null && skill.tdcSkill !== undefined)
          .map((skill: any): TdcSkillGap => ({
            tdcSkill: skill.tdcSkill,
            tdcProficiencyLevel: skill.tdcProficiencyLevel,
            oldValue: skill.oldValue ?? null,
            isNew: skill.isNew ?? false,
            isEdited: skill.isEdited ?? false
          }));
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
    const employeeId = Number(this.selectedLearnerId);
    const payload = {
      EmployeeId: employeeId,
      keyTasks: changedKeyTasks,
      coreSkills: changedCoreSkills,
      tdcSkills: changedTdcSkills
    };

    this.talentEvolutionService.UpdateEmployeeSkills(payload).subscribe({
      next: (res) => {
        this.resetFlags();
        this.groupedKeyData.forEach(group => group.isEditing = false);
        this.isCoreEditing = false;
        this.isTdcEditing = false;
        this.resetAllData();   // ✅ clears before re-fetch
        // Refresh data
        this.editSkillsByEmployee();
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

  // ===========================
  // Section: END Role Management
  // ===========================

}
