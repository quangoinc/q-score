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

// Get a user by ID
export async function getUser(id: string): Promise<TeamMember | undefined> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar || undefined,
  };
}
