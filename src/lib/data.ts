import { TeamMember, Task, PointEntry } from "./types";

// Sample team members
export const teamMembers: TeamMember[] = [
    { id: "1", name: "Gage", avatar: "/avatars/gage.jpg" },
    { id: "2", name: "Derek", avatar: "/avatars/derek.jpg" },
    { id: "3", name: "Nick", avatar: "/avatars/nick.jpg" },
    { id: "4", name: "Ellie", avatar: "/avatars/ellie.jpg" },
    { id: "5", name: "Elias", avatar: "/avatars/elias.jpg" },
];

// Predefined tasks with point values
export const tasks: Task[] = [
    { id: "1", name: "Cold call", points: 1 },
    { id: "2", name: "Discovery Call", points: 2 },
    { id: "3", name: "Site Mockup", points: 10 },
    { id: "4", name: "Site Design v1", points: 10 },
    { id: "5", name: "Site Design Revisions", points: 10 },
    { id: "6", name: "Published Site", points: 35 },
];

// Point entries (empty for now - we'll add logging functionality next)
export const pointEntries: PointEntry[] = [];
