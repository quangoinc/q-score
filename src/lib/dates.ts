// Date utilities for weekly calculations

// Get the start of last week (previous Sunday at 00:00:00)
export function getLastWeekStart(date: Date = new Date()): Date {
  const currentWeek = getWeekStart(date);
  const lastWeek = new Date(currentWeek);
  lastWeek.setDate(lastWeek.getDate() - 7);
  return lastWeek;
}

// Get the start of the current week (Sunday at 00:00:00)
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Sunday = 0 in JS, so just go back 'day' days to reach Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get array of dates for the current week (Sun-Sat)
export function getWeekDays(date: Date = new Date()): Date[] {
  const start = getWeekStart(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
}

// Format date as short day name
export function formatDayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// Check if a date falls within a given week
export function isInWeek(date: Date, weekStart: Date): boolean {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

// Check if date is today or before today (in current week)
export function isUpToToday(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

// Format a date as relative time ago
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "just now";
  } else if (diffMins < 60) {
    return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
