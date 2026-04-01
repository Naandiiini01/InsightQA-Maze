export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  ownerId: string;
  createdAt: string;
}

export type StudyType = 'prototype' | 'survey' | 'website' | 'task';
export type StudyStatus = 'draft' | 'active' | 'completed';

export interface WelcomeBlock {
  type: 'welcome';
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ThankYouBlock {
  type: 'thankyou';
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface IntroBlock {
  type: 'intro';
  id: string;
  title: string;
  description: string;
  researcherNote?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ContextBlock {
  type: 'context';
  id: string;
  scenarioText: string;
  imageUrl?: string;
  videoUrl?: string;
  deviceInstructions?: string;
}

export interface Task {
  type: 'task';
  id: string;
  title: string;
  instructions: string;
  successPath?: string;
  imageUrl?: string;
  videoUrl?: string;
  websiteUrl?: string;
  timer?: number;
  followUpQuestions?: Question[];
}

export interface Question {
  type: 'question';
  id: string;
  text: string;
  questionType: 'mcq' | 'open-ended';
  options?: string[];
  required: boolean;
  imageUrl?: string;
  videoUrl?: string;
}

export type Block = WelcomeBlock | IntroBlock | ContextBlock | Task | Question | ThankYouBlock;

export interface Study {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  type: StudyType;
  status: StudyStatus;
  blocks: Block[];
  config: {
    allowCamera?: boolean;
    allowMicrophone?: boolean;
    showTimer?: boolean;
    deviceType?: 'mobile' | 'tablet' | 'desktop' | 'laptop' | 'responsive';
  };
  prototypeUrls?: string[];
  createdAt: string;
}

export interface ResponseMetric {
  timeTaken: number;
  successRate: number;
  clicks: { x: number; y: number; timestamp: number; target?: string }[];
  dropOffStep?: number;
  recordingUrl?: string;
}

export interface Participant {
  id: string;
  email: string;
  name: string;
  ownerId: string;
  status: 'invited' | 'completed' | 'active';
  assignedStudyId?: string;
  assignedVariantUrl?: string;
  completionRate: number;
  timeTaken?: number; // average or total
  createdAt: string;
  lastActive?: string;
}

export interface StudyResponse {
  id: string;
  studyId: string;
  ownerId: string;
  participantId: string;
  variantUrl?: string;
  results: { taskId: string; success: boolean; time: number; answer?: string }[];
  metrics: ResponseMetric;
  createdAt: string;
}
