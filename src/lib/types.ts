// Core data models for Q-Score

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  face?: number;
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
  quantity: number;
  timestamp: Date;
  dailyBonus?: boolean;
  customTaskName?: string;
  customTaskPoints?: number;
}

// Daily bonus points for first task of the day
export const DAILY_BONUS_POINTS = 50;
