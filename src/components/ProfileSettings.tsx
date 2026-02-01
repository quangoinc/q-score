"use client";

import { useState, useEffect, useRef } from "react";
import { TeamMember } from "@/lib/types";
import { QUE_COLORS, FACE_VARIANT_COUNT, updateUserProfile } from "@/lib/users";
import { Que, FACE_VARIANTS } from "@/components/Que";

interface ProfileSettingsProps {
  user: TeamMember;
  onClose: () => void;
  onSave: (updatedUsers: TeamMember[]) => void;
}

export function ProfileSettings({ user, onClose, onSave }: ProfileSettingsProps) {
  const [selectedColor, setSelectedColor] = useState(user.color || QUE_COLORS[0]);
  const [selectedFace, setSelectedFace] = useState(user.face ?? 0);
  const [isSaving, setIsSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Delay adding listener to prevent immediate close
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUsers = await updateUserProfile(user.id, {
        color: selectedColor,
        face: selectedFace,
      });
      onSave(updatedUsers);
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedColor !== user.color || selectedFace !== user.face;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 animate-fade-in"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Customize Your Que</h3>
        <p className="text-xs text-muted mt-1">Choose your avatar style</p>
      </div>

      {/* Preview */}
      <div className="px-5 py-6 flex justify-center border-b border-border bg-background/50">
        <Que
          fill={selectedColor}
          face={selectedFace}
          width={100}
          height={100}
          className="transition-all duration-200"
        />
      </div>

      {/* Color Selection */}
      <div className="px-5 py-4 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-3">Color</label>
        <div className="grid grid-cols-5 gap-2">
          {QUE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                selectedColor === color
                  ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Face Selection */}
      <div className="px-5 py-4 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-3">Expression</label>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: FACE_VARIANT_COUNT }).map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedFace(index)}
              className={`p-1 rounded-lg transition-all bg-background border ${
                selectedFace === index
                  ? "border-white scale-110"
                  : "border-border hover:border-muted hover:scale-105"
              }`}
              title={`${FACE_VARIANTS[index].eyes} eyes, ${FACE_VARIANTS[index].mouth} mouth`}
            >
              <Que
                fill={selectedColor}
                face={index}
                width={32}
                height={32}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-background border border-border text-muted text-sm font-medium rounded-lg hover:text-foreground hover:border-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex-1 px-4 py-2.5 bg-crimson text-white text-sm font-medium rounded-lg hover:bg-crimson-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
