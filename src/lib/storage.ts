import { PointEntry } from "./types";

const STORAGE_KEY = "qscore_entries";

// Serialized format for storage (ISO string for dates)
interface StoredPointEntry {
  id: string;
  memberId: string;
  taskId: string;
  quantity?: number; // Optional for backwards compatibility
  timestamp: string; // ISO 8601 format
}

// Convert PointEntry to storage format
function toStoredEntry(entry: PointEntry): StoredPointEntry {
  return {
    id: entry.id,
    memberId: entry.memberId,
    taskId: entry.taskId,
    quantity: entry.quantity,
    timestamp: entry.timestamp.toISOString(),
  };
}

// Convert storage format back to PointEntry
function fromStoredEntry(stored: StoredPointEntry): PointEntry {
  return {
    id: stored.id,
    memberId: stored.memberId,
    taskId: stored.taskId,
    quantity: stored.quantity ?? 1, // Default to 1 for old entries
    timestamp: new Date(stored.timestamp),
  };
}

// Load all entries from localStorage
export function loadEntries(): PointEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const stored: StoredPointEntry[] = JSON.parse(data);
    return stored.map(fromStoredEntry);
  } catch (error) {
    console.error("Failed to load entries from storage:", error);
    return [];
  }
}

// Save all entries to localStorage
export function saveEntries(entries: PointEntry[]): void {
  if (typeof window === "undefined") return;

  try {
    const stored = entries.map(toStoredEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error("Failed to save entries to storage:", error);
  }
}

// Add a single entry (loads, appends, saves)
export function addEntry(entry: PointEntry): PointEntry[] {
  const entries = loadEntries();
  const updated = [...entries, entry];
  saveEntries(updated);
  return updated;
}

// Delete an entry by ID
export function deleteEntry(id: string): PointEntry[] {
  const entries = loadEntries();
  const updated = entries.filter((e) => e.id !== id);
  saveEntries(updated);
  return updated;
}

// Update an existing entry
export function updateEntry(id: string, updates: Partial<Omit<PointEntry, "id">>): PointEntry[] {
  const entries = loadEntries();
  const updated = entries.map((e) => {
    if (e.id === id) {
      return { ...e, ...updates };
    }
    return e;
  });
  saveEntries(updated);
  return updated;
}

// Clear all entries
export function clearEntries(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
