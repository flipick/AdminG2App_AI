import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolePlayScenarioService } from '../../../services/roleplayscenario-service';
import { IRolePlayEvaluationCriteria, IRolePlayLearningObjective, IRolePlayScenario } from '../../../model/role-play-scenario';


@Component({
  selector: 'app-role-play-scenario-builder',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './role-play-scenario-builder.html',
  styleUrls: ['./role-play-scenario-builder.css']
})
export class RolePlayScenarioBuilder implements OnInit {
  @Input() AssessmentId: number = 0;
  @Output() RedirectToReviewAndPublish = new EventEmitter<void>();

  scenarioForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private scenarioService: RolePlayScenarioService) { }

  ngOnInit(): void {
    this.scenarioForm = this.fb.group({
      scenarioId: [0],
      title: ['', Validators.required],
      description: [''],
      duration: [15, [Validators.required, Validators.min(1)]],
      roles: [''],
      assessmentId: [this.AssessmentId],
      learningObjective: this.fb.array([]),
      evaluationCriteria: this.fb.array([])
    });

    if (this.AssessmentId > 0) {
      this.loadScenario(this.AssessmentId);
    } else {
      this.addLearningObjective();
      this.addCriteria();
    }
  }

  // Form Controls
  get f(): { [key: string]: AbstractControl } {
    return this.scenarioForm.controls;
  }

  // Learning Objectives
  get learningObjective(): FormArray {
    return this.scenarioForm.get('learningObjective') as FormArray;
  }

  addLearningObjective(obj?: IRolePlayLearningObjective): void {
    this.learningObjective.push(
      this.fb.group({
        objectiveId: [obj?.objectiveId || 0],
        scenarioId: [obj?.scenarioId || 0],
        objective: [obj?.objective || '', Validators.required],
        isRemoved: [obj?.isRemoved || false]  
      })
    );
  }

  removeLearningObjective(index: number): void {
    //this.learningObjective.removeAt(index);
    const control = this.learningObjective.at(index);
    control.patchValue({ isRemoved: true }); 
  }

  // Evaluation Criteria
  get evaluationCriteria(): FormArray {
    return this.scenarioForm.get('evaluationCriteria') as FormArray;
  }

  addCriteria(obj?: IRolePlayEvaluationCriteria): void {
    this.evaluationCriteria.push(
      this.fb.group({
        criteriaId: [obj?.criteriaId || 0],
        scenarioId: [obj?.scenarioId || 0],
        criteria: [obj?.criteria || '', Validators.required],
        points: [obj?.points || 0, [Validators.required, Validators.min(1)]],
        isRemoved: [obj?.isRemoved || false]   
      })
    );
  }

  removeCriteria(index: number): void {
    //this.evaluationCriteria.removeAt(index);
      const control = this.evaluationCriteria.at(index);
    control.patchValue({ isRemoved: true });   // mark as removed
  }

  // Load scenario by AssessmentId
  private loadScenario(assessmentId: number): void {
    this.scenarioService.getScenarioByAssessmentId(assessmentId).subscribe({
      next: (scenario: IRolePlayScenario) => {
        if (scenario) {
          this.scenarioForm.patchValue({
            scenarioId: scenario.scenarioId,
            title: scenario.title,
            description: scenario.description,
            duration: scenario.duration,
            roles: scenario.roles,
            assessmentId: scenario.assessmentId
          });

          // Clear existing FormArrays
          this.learningObjective.clear();
          this.evaluationCriteria.clear();

          // Populate Learning Objectives
          scenario.learningObjective?.forEach((obj:any) => this.addLearningObjective(obj));

          // Populate Evaluation Criteria
          scenario.evaluationCriteria?.forEach((obj:any) => this.addCriteria(obj));
        }
      },
      error: (err:any) => {
        this.errorMessage = 'Error loading scenario: ' + err.message;
      }
    });
  }

  // Save form
  saveScenario(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.scenarioForm.invalid) {
      this.scenarioForm.markAllAsTouched();
      return;
    }

    const payload: IRolePlayScenario = {
    ...this.scenarioForm.value,
    learningObjective: this.learningObjective.value,
    evaluationCriteria: this.evaluationCriteria.value
  };

    this.scenarioService.addUpdateScenario(payload).subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          this.successMessage = 'Scenario saved successfully!';
          this.scenarioForm.patchValue({ scenarioId: res.id });
          this.RedirectToReviewAndPublish.emit();
        }
      },
      error: (err) => {
        this.errorMessage = 'Error saving scenario: ' + err.message;
      }
    });
  }
}
