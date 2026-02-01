import { TeamMember } from "./types";
import { supabase } from "./supabase";

// Vibrant color palette for dark theme backgrounds
export const QUE_COLORS = [
  "#E85D75", // rose
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
  "#6366F1", // indigo
];

// Number of face variants available
export const FACE_VARIANT_COUNT = 10;

// Get the next available color from the palette
function getNextColor(existingColors: (string | undefined)[]): string {
  const usedColors = new Set(existingColors.filter(Boolean));
  // Find first unused color
  for (const color of QUE_COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  // If all colors used, cycle back using count
  return QUE_COLORS[usedColors.size % QUE_COLORS.length];
}

// Get the next available face variant
function getNextFace(existingFaces: (number | null | undefined)[]): number {
  const usedFaces = new Set(existingFaces.filter((f): f is number => f !== null && f !== undefined));
  // Find first unused face
  for (let i = 0; i < FACE_VARIANT_COUNT; i++) {
    if (!usedFaces.has(i)) {
      return i;
    }
  }
  // If all faces used, pick randomly
  return Math.floor(Math.random() * FACE_VARIANT_COUNT);
}

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
    color: user.color || undefined,
    face: user.face ?? undefined,
  }));
}

// Add or update a user (returns all users)
export async function upsertUser(user: TeamMember): Promise<TeamMember[]> {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("color, face")
    .eq("id", user.id)
    .single();

  let color = user.color || existingUser?.color;
  let face = user.face ?? existingUser?.face;

  // Assign new color and face if user doesn't have them
  if (!color || face === undefined || face === null) {
    const { data: allUsers } = await supabase
      .from("users")
      .select("color, face");

    if (!color) {
      const existingColors = allUsers?.map((u) => u.color) || [];
      color = getNextColor(existingColors);
    }

    if (face === undefined || face === null) {
      const existingFaces = allUsers?.map((u) => u.face) || [];
      face = getNextFace(existingFaces);
    }
  }

  const { error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      name: user.name,
      avatar: user.avatar || null,
      color,
      face,
    });

  if (error) {
    console.error("Failed to upsert user:", error);
  }

  return loadUsers();
}

// Update user profile (color and face only)
export async function updateUserProfile(
  userId: string,
  updates: { color?: string; face?: number }
): Promise<TeamMember[]> {
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user profile:", error);
  }

  return loadUsers();
}
