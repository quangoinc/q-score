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
    { id: "1", name: "Found a new lead", points: 1 },
    { id: "2", name: "Made a new post", points: 11 },
    { id: "3", name: "Sent media used in a post", points: 10 },
    { id: "4", name: "Wrote caption used in a post", points: 5 },
    { id: "5", name: "", points: 10 },
];

// Point entries (empty for now - we'll add logging functionality next)
export const pointEntries: PointEntry[] = [];
