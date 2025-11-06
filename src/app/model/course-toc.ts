export interface TopicRequest {
  TopicId?: number;                // 0 => new
  TopicTitle: string;
  CurriculumSectionId: number;    // required by backend
  Description?: string;
}
export interface CurriculumSectionRequest {
  courseId: number;
  tenantId: string; 
  curriculumSectionId: number; 
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  contentType?: string;
  file?: File;
  url?: string;
  duration?: string;
  saved?: boolean;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  saved: boolean;
  description?: string;
  curriculumId?: number;
}


// topic.model.ts
export interface Topic {
  topicId: number;
  topicTitle: string;
  description: string;
  saved: boolean;
  topicDetails: TopicDetail[];
  curriculumSectionId: number;
}

export interface TopicDetail {
  topicDetailsId: number;
  topicDetailsTitle: string;
  description: string;
  saved: boolean;
  duration: string;
  contentType: string;
  file?: File;
  url: string;
  topicid: string;
  fileId: number;  
  fileName: string;
  durationtype: string;
}

export interface ReSequenceRequest {
  curriculumSectionId: number;
  topics: {
    topicId: number;
    sequenceOrder: number;
    topicDetails: {
      topicDetailsId: number;
      sequenceOrder: number;
    }[];
  }[];
}
