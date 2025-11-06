import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SkillService } from '../../../services/skill-services';

@Component({
  selector: 'app-delete-sector-track-role',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-sector-track-role.html',
  styleUrls: ['./delete-sector-track-role.css']
})
export class DeleteSectorTrackRole {
  @Input() roleId: number | null = null;  // jobRoleId
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private skillService: SkillService) {}

  confirmDelete(): void {
    if (!this.roleId) return;
    this.skillService.deleteSectorTrackRole(this.roleId).subscribe({
        next: (res: any) => {
            if (!res.isError && res.statusCode === 200) {
                this.deleted.emit(); // notify parent to reload grid
            } else {
                console.error('Delete failed:', res.message);
            }
        },
        error: (err) => {
            console.error('Error deleting role:', err);
        }
    });
}


  cancelDelete(): void {
    this.close.emit();
  }
}
