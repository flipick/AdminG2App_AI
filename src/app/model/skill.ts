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
  oldValue?: string;
  isAlreadyCreated?: boolean;
  isNew?: boolean;
  isEdited?: boolean;
}

export interface GroupedKeyTask {
  criticalWorkFunction: string;
  oldValue?: string;
  isEdited?: boolean;
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