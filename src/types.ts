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

export interface Task {
  id: string;
  title: string;
  instructions: string;
  successPath?: string; // e.g., "checkout-button-clicked"
  imageUrl?: string;
  timer?: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'open-ended';
  options?: string[];
  required: boolean;
}

export interface Study {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  type: StudyType;
  status: StudyStatus;
  tasks: Task[];
  questions: Question[];
  config: {
    allowCamera?: boolean;
    allowMicrophone?: boolean;
    showTimer?: boolean;
  };
  prototypeUrl?: string;
  createdAt: string;
}

export interface ResponseMetric {
  timeTaken: number;
  successRate: number;
  clicks: { x: number; y: number; timestamp: number; target?: string }[];
  dropOffStep?: number;
}

export interface Participant {
  id: string;
  email: string;
  name: string;
  ownerId: string;
  status: 'invited' | 'completed' | 'active';
  assignedStudyId?: string;
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
  results: { taskId: string; success: boolean; time: number; answer?: string }[];
  metrics: ResponseMetric;
  createdAt: string;
}
