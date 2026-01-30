// Core data models for Q-Score

export interface TeamMember {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  points: number;
}

export interface PointEntry {
  id: string;
  memberId: string;
  taskId: string;
  timestamp: Date;
}
