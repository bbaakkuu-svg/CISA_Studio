export type TargetOutputFormat = 'pdf' | 'xlsx' | 'pptx' | 'docx' | 'code';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type GenerationPhase = 
  | 'inbox' 
  | 'detection' 
  | 'normalization' 
  | 'rubric_analysis' 
  | 'solution_generation' 
  | 'exporting' 
  | 'ready';

export type FileRole = 'statement' | 'rubric' | 'supporting_data';

export interface TaskFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  role: FileRole;
  previewUrl?: string;
  extractedText?: string;
  fileObject?: File;
}

export interface RubricCriteria {
  id: string;
  name: string;
  weightPercentage: number;
  maxScore: number;
  descriptionMaxLevel: string;
  evaluationHints?: string;
}

export interface AutoEvalItem {
  criteriaName: string;
  weight: number;
  scoreAchieved: number;
  justification: string;
  evidenceSnippets: string[];
}

export interface GeneratedSolutionData {
  id: string;
  taskId: string;
  title: string;
  executiveSummary: string;
  markdownContent: string;
  autoEvalMatrix: AutoEvalItem[];
  scoreEstimated: number;
  sections: {
    title: string;
    content: string;
    subsections?: { subtitle: string; text: string }[];
  }[];
  excelData?: {
    sheetName: string;
    headers: string[];
    rows: (string | number)[][];
    summaryFormulas?: { label: string; formula: string; result: number | string }[];
  };
  slidesData?: {
    title: string;
    bullets: string[];
    speakerNotes?: string;
  }[];
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  userId?: string;
  title: string;
  description: string;
  targetFormat: TargetOutputFormat;
  status: TaskStatus;
  currentPhase: GenerationPhase;
  progressPercentage: number;
  files: TaskFileItem[];
  rubrics: RubricCriteria[];
  solution?: GeneratedSolutionData;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'student' | 'educator' | 'researcher' | 'admin';
  defaultOutputFormat: TargetOutputFormat;
}
