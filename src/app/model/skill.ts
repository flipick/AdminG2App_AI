// ==================== Sector/Track/Role ====================
export interface IJobSector {
  sectorId: number;
  sectorName: string;
  trackList: IJobTrack[];
}

export interface IJobTrack {
  trackId: number;
  trackName: string;
  jobRoleList: IJobRole[];
}

export interface IJobRole {
  isChecked: boolean;
  isCheckedAsignToTenant: boolean;
  jobRoleId: number;
  jobRoleName: string;
  isbaseRole: boolean;
  jobRoleDescription: string;
  sectorName?: string;   // Optional: populated when loading tenant roles
  trackName?: string;    // Optional: populated when loading tenant roles
  addedByUser?: number;  // Optional: 1 = custom role, 0 = standard role
  // API alternative field names
  jobRole?: string;      // API sometimes returns 'jobRole' instead of 'jobRoleName'
  sector?: string;       // API sometimes returns 'sector' instead of 'sectorName'
  track?: string;        // API sometimes returns 'track' instead of 'trackName'
  tenantJobRoleId?: number; // API returns this for tenant-assigned roles
}

// ==================== API Request Body ====================
export interface SectorRequest {
  pageIndex: number;
  pageSize: number;
  filter: {
    colId: string;
    name: string;
    value: string;
    type: string;
  }[];
}

// ==================== Key Task & Group ====================
export interface KeyTask {
  keyTaskSkill: string;
  criticalWorkFunction?: string;  // Added: needed for grouping from API response
  oldValue?: string;
  isAlreadyCreated?: boolean;
  isNew?: boolean;
  isEdited?: boolean;
}

export interface GroupedKeyTask {
  criticalWorkFunction: string;
  oldValue?: string;
  isEdited?: boolean;
  isEditing?: boolean;  // Added: UI state for inline editing mode
  tasks: KeyTask[];
}

// ==================== Core Skill ====================
export interface CoreSkillGap {
  coreSkill: string;
  proficiencyLevel: string;
  oldValue?: string;
  isNew?: boolean;
  isEdited?: boolean;
}

// ==================== TDC Skill ====================
export interface TdcSkillGap {
  tdcSkill: string;
  tdcProficiencyLevel: string;
  oldValue?: string;
  isNew?: boolean;
  isEdited?: boolean;
}

// ==================== API Response Wrapper ====================
export interface ApiResponse<T> {
  success?: boolean;
  isValidationError?: boolean;
  statusCode: number;
  message?: string;
  result: T;
  error?: any;
  isError: boolean;
}

// ==================== Skill Master ====================
export interface Track {
  trackId: number;
  trackName: string;
  jobRoleList?: any[];
}

export interface Sector {
  sectorId: number;
  sectorName: string;
  trackList?: Track[];
}

export interface TrackTableRow {
  sector: string;
  trackId: number;
  trackName: string;
}
