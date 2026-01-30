import { TeamMember, Task, PointEntry } from "./types";

// Sample team members
export const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen" },
  { id: "2", name: "Jordan Mills" },
  { id: "3", name: "Sam Rivera" },
  { id: "4", name: "Taylor Kim" },
];

// Predefined tasks with point values
export const tasks: Task[] = [
  { id: "1", name: "Cold Call Session", points: 5 },
  { id: "2", name: "Client Meeting", points: 10 },
  { id: "3", name: "Project Completed", points: 25 },
  { id: "4", name: "New Lead Generated", points: 15 },
  { id: "5", name: "Social Post Published", points: 3 },
  { id: "6", name: "Proposal Sent", points: 8 },
];

// Point entries (empty for now - we'll add logging functionality next)
export const pointEntries: PointEntry[] = [];
