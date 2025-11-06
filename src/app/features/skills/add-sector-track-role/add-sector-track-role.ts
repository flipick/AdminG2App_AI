import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiResponse, SkillService } from '../../../services/skill-services';
import { DeleteSectorTrackRole } from '../delete-sector-track-role/delete-sector-track-role';
import { Popup } from '../../../shared/popup/popup';
import { PopupConfig } from '../../../model/popupconfig';

@Component({
  selector: 'app-add-sector-track-role',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteSectorTrackRole, Popup],
  templateUrl: './add-sector-track-role.html',
  styleUrls: ['./add-sector-track-role.css']
})
export class AddSectorTrackRole {
  // ------------------- Inputs & Outputs -------------------
  @Input() tenantlist: any[] = [];
  @Input() selectedTenantId: string = '';
  @Output() added = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  // ------------------- ViewChild -------------------
  @ViewChild('popup') popup?: Popup;
  @ViewChild('deleteSectorTrackRole') deleteSectorTrackRole?: DeleteSectorTrackRole;

  // ------------------- Properties -------------------
  popupConfig: PopupConfig = new PopupConfig();
  deleteRoleId: number | null = null;
  selectedRoleId: number | null = null;

  newTenantId: string = '';
  newSector: string = '';
  newTrack: string = '';
  newRole: string = '';
  jobRoleDescription: string = '';
  addMessage: string = '';
  errorMessage: string = '';

  showForm: boolean = false;

  // ------------------- Data Containers -------------------
  rawData: any[] = [];
  sectors: any[] = [];
  tracks: any[] = [];
  roles: any[] = [];
  filteredSectors: string[] = [];
  filteredTracks: string[] = [];

  //---------------------- Pagination ----------------------
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pagedRoles: any[] = [];
  totalPages: number = 0;


  constructor(private skillService: SkillService) {}

  // ------------------- Lifecycle -------------------
  ngOnInit() {
    this.newTenantId = this.selectedTenantId;
    this.getSectorData();
  }

  // ------------------- Fetch & Prepare Data -------------------
  getSectorData(): void {
    this.skillService.getSectorsTracksJobRoles(0, 0).subscribe({
      next: (res: ApiResponse<any>) => {
        if (!res.isError && res.statusCode === 200 && res.result?.data) {
          this.rawData = res.result.data;
          this.prepareData();
        } else {
          this.errorMessage = res.message || 'Failed to fetch sector data.';
        }
      },
      error: () => (this.errorMessage = 'An unexpected error occurred while fetching data.')
    });
  }

  prepareData(): void {
    this.sectors = this.rawData.map((s: any) => ({
      sectorId: s.sectorId,
      sectorName: s.sectorName
    }));

    this.tracks = [];
    this.roles = [];

    this.rawData.forEach((s: any) => {
      s.trackList?.forEach((t: any) => {
        this.tracks.push({
          sector: s.sectorName,
          trackId: t.trackId,
          trackName: t.trackName
        });

        // ✅ Only show user-added roles
        t.jobRoleList
          ?.filter((r: any) => r.addedByUser === 1)
          .forEach((r: any) => {
            this.roles.push({
              sector: s.sectorName,
              track: t.trackName,
              jobRoleId: r.jobRoleId,
              jobRoleName: r.jobRoleName,
              jobRoleDescription: r.jobRoleDescription,
              addedByUser: r.addedByUser
            });
          });
      });
    });
    this.updatePagedRoles();
  }

  // ------------------- Filtering -------------------
  filterSectors() {
    const val = this.newSector.toLowerCase();
    this.filteredSectors = this.rawData
      .map(s => s.sectorName)
      .filter(name => name.toLowerCase().includes(val));
  }

  selectSector(sector: string) {
    this.newSector = sector;
    this.filteredSectors = [];
    this.newTrack = '';
  }

  filterTracks() {
    if (!this.newSector) {
      this.filteredTracks = [];
      return;
    }

    const sectorObj = this.rawData.find((s: any) => s.sectorName === this.newSector);
    if (!sectorObj) {
      this.filteredTracks = [];
      return;
    }

    const val = this.newTrack.toLowerCase();
    this.filteredTracks = sectorObj.trackList
      ?.map((t: any) => t.trackName)
      .filter((name: string) => name.toLowerCase().includes(val)) || [];
  }

  selectTrack(track: string) {
    this.newTrack = track;
    this.filteredTracks = [];
  }

  // ------------------- Add / Update -------------------
  onAdd(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const payload = {
      tenantId: this.newTenantId,
      sectorName: this.newSector,
      trackName: this.newTrack,
      roleName: this.newRole,
      jobRoleDescription: this.jobRoleDescription,
      roleId: this.selectedRoleId ? this.selectedRoleId.toString() : '0'
    };

    this.skillService.addSectorTrackRole(payload).subscribe({
      next: (res: any) => {
        if (!res.isError && res.statusCode === 200) {
          const newId = res.result?.roleId || Date.now();

          if (this.selectedRoleId) {
            // Update existing role
            const index = this.roles.findIndex(r => r.jobRoleId === this.selectedRoleId);
            if (index !== -1) {
              this.roles[index] = {
                ...this.roles[index],
                sector: this.newSector,
                track: this.newTrack,
                jobRoleName: this.newRole,
                jobRoleDescription: this.jobRoleDescription
              };
            }
            this.addMessage = 'Updated successfully!';
          } else {
            // Add new role
            this.roles.push({
              jobRoleId: newId,
              sector: this.newSector,
              track: this.newTrack,
              jobRoleName: this.newRole,
              jobRoleDescription: this.jobRoleDescription,
              addedByUser: 1
            });
            this.addMessage = 'Added successfully!';
          }
          this.updatePagedRoles();
          this.added.emit(payload);
          this.resetForm();
          this.showForm = false;
        } else {
          this.addMessage = res.message || 'Failed to save record.';
        }
      },
      error: () => (this.addMessage = 'Unexpected error occurred while saving.')
    });
  }

  // ------------------- Edit -------------------
  EditRoleData(item: any) {
    this.selectedRoleId = item.jobRoleId;
    this.newTenantId = this.selectedTenantId;
    this.newSector = item.sector;
    this.newTrack = item.track;
    this.newRole = item.jobRoleName;
    this.jobRoleDescription = item.jobRoleDescription || '';
    this.addMessage = '';
    this.showForm = true;
  }

  // ------------------- Delete -------------------
  DeleteRoleData(item: any) {
    this.deleteRoleId = item.jobRoleId;

    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Role',
      buttons: [
        { label: 'Yes, Delete Role', cssClass: 'bg-red-600 text-white hover:bg-red-700', action: 'custom', emitEventName: 'RoleDeleteConfirm' },
        { label: 'Cancel', cssClass: 'bg-gray-200 text-gray-800 hover:bg-gray-300', action: 'custom', emitEventName: 'RoleDeleteCancel' }
      ]
    };
  }

  handlePopupAction(action: string) {
    if (action === 'RoleDeleteConfirm') this.deleteSectorTrackRole?.confirmDelete();
    if (action === 'RoleDeleteCancel') this.deleteSectorTrackRole?.cancelDelete();
  }

  onRoleDeleted() {
    this.roles = this.roles.filter(r => r.jobRoleId !== this.deleteRoleId);
    this.updatePagedRoles();
    this.closePopup();
  }

  closePopup() {
    this.popupConfig.isShowPopup = false;
  }

  // ------------------- Form Toggle -------------------
  showAddForm() {
    this.resetForm();
    this.showForm = true;
  }

  onCancel() {
    this.resetForm();
    this.showForm = false;
  }

  private resetForm() {
    this.newSector = '';
    this.newTrack = '';
    this.newRole = '';
    this.jobRoleDescription = '';
    this.selectedRoleId = null;
    this.addMessage = '';
    this.filteredSectors = [];
    this.filteredTracks = [];
  }

  // ------------------- Pagination Logic -------------------
  updatePagedRoles() {
    // debugger;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedRoles = this.roles.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.roles.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedRoles();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedRoles();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedRoles();
    }
  }

}
