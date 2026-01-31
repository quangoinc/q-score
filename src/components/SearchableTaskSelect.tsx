"use client";

import { useState, useRef, useEffect } from "react";
import { Task } from "@/lib/types";

interface SearchableTaskSelectProps {
  tasks: Task[];
  value: string;
  onChange: (value: string) => void;
}

export function SearchableTaskSelect({ tasks, value, onChange }: SearchableTaskSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sort tasks by points (highest first)
  const sortedTasks = [...tasks].sort((a, b) => b.points - a.points);

  // Filter tasks based on search
  const filteredTasks = sortedTasks.filter((task) =>
    task.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get selected task name for display
  const selectedTask = tasks.find((t) => t.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (taskId: string) => {
    onChange(taskId);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative z-[9999]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-left focus:outline-none focus:border-crimson transition-colors"
      >
        {selectedTask ? (
          <span className="text-foreground">
            {selectedTask.name} (+{selectedTask.points} pts)
          </span>
        ) : (
          <span className="text-muted">Select task...</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-[#0a0a0a] border border-border rounded-lg shadow-xl overflow-hidden" style={{ isolation: "isolate" }}>
          <div className="p-2 border-b border-border">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-crimson"
            />
          </div>
          <div className="max-h-60 overflow-y-auto bg-[#0a0a0a]">
            {filteredTasks.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted">No tasks found</div>
            ) : (
              filteredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleSelect(task.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-card transition-colors flex justify-between items-center bg-[#0a0a0a] ${
                    task.id === value ? "bg-card" : ""
                  }`}
                >
                  <span className="text-foreground">{task.name}</span>
                  <span className="text-sm text-crimson font-medium">+{task.points}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
