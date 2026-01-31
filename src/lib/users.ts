import { TeamMember } from "./types";
import { supabase } from "./supabase";

// Load all users from database
export async function loadUsers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load users:", error);
    return [];
  }

  return data.map((user) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar || undefined,
  }));
}

// Add or update a user (returns all users)
export async function upsertUser(user: TeamMember): Promise<TeamMember[]> {
  const { error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      name: user.name,
      avatar: user.avatar || null,
    });

  if (error) {
    console.error("Failed to upsert user:", error);
  }

  return loadUsers();
}
