import { PointEntry } from "./types";
import { supabase } from "./supabase";

// Load all entries from database
export async function loadEntries(): Promise<PointEntry[]> {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Failed to load entries:", error);
    return [];
  }

  return data.map((entry) => ({
    id: entry.id,
    memberId: entry.member_id,
    taskId: entry.task_id,
    quantity: entry.quantity,
    timestamp: new Date(entry.timestamp),
  }));
}

// Add a single entry
export async function addEntry(entry: PointEntry): Promise<PointEntry[]> {
  const { error } = await supabase
    .from("entries")
    .insert({
      id: entry.id,
      member_id: entry.memberId,
      task_id: entry.taskId,
      quantity: entry.quantity,
      timestamp: entry.timestamp.toISOString(),
    });

  if (error) {
    console.error("Failed to add entry:", error);
  }

  return loadEntries();
}

// Delete an entry by ID
export async function deleteEntry(id: string): Promise<PointEntry[]> {
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete entry:", error);
  }

  return loadEntries();
}

// Update an existing entry
export async function updateEntry(
  id: string,
  updates: Partial<Omit<PointEntry, "id">>
): Promise<PointEntry[]> {
  const updateData: Record<string, unknown> = {};

  if (updates.memberId !== undefined) updateData.member_id = updates.memberId;
  if (updates.taskId !== undefined) updateData.task_id = updates.taskId;
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
  if (updates.timestamp !== undefined) updateData.timestamp = updates.timestamp.toISOString();

  const { error } = await supabase
    .from("entries")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Failed to update entry:", error);
  }

  return loadEntries();
}

// Restore an entry (for undo functionality)
export async function restoreEntry(entry: PointEntry): Promise<PointEntry[]> {
  return addEntry(entry);
}
