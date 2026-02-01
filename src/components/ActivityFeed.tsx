"use client";

import { useMemo, useState } from "react";
import { PointEntry, TeamMember, Task } from "@/lib/types";
import { Que } from "@/components/Que";
import { formatTimeAgo } from "@/lib/dates";

interface ActivityFeedProps {
  entries: PointEntry[];
  teamMembers: TeamMember[];
  tasks: Task[];
  limit?: number;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Omit<PointEntry, "id">>) => void;
}

interface EditingState {
  id: string;
  memberId: string;
  taskId: string;
  quantity: number;
}

export function ActivityFeed({
  entries,
  teamMembers,
  tasks,
  limit = 15,
  onDelete,
  onUpdate,
}: ActivityFeedProps) {
  const [editingEntry, setEditingEntry] = useState<EditingState | null>(null);

  // Get member by ID
  const getMember = (memberId: string): TeamMember | undefined => {
    return teamMembers.find((m) => m.id === memberId);
  };

  // Get task by ID
  const getTask = (taskId: string): Task | undefined => {
    return tasks.find((t) => t.id === taskId);
  };

  // Sort entries by timestamp (newest first) and limit
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [entries, limit]);

  const handleEditClick = (entry: PointEntry) => {
    setEditingEntry({
      id: entry.id,
      memberId: entry.memberId,
      taskId: entry.taskId,
      quantity: entry.quantity,
    });
  };

  const handleEditSave = () => {
    if (editingEntry && onUpdate) {
      onUpdate(editingEntry.id, {
        memberId: editingEntry.memberId,
        taskId: editingEntry.taskId,
        quantity: editingEntry.quantity,
      });
    }
    setEditingEntry(null);
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
  };

  const handleDeleteClick = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    setEditingEntry(null);
  };

  if (recentEntries.length === 0) {
    return (
      <div className="animate-fade-in stagger-5">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-muted text-sm font-medium">—— [ 04 ]</span>
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="bg-card/30 border border-border rounded-xl p-8 text-center text-muted">
          No activity yet. Log some points to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in stagger-5">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-muted text-sm font-medium">—— [ 04 ]</span>
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      <div className="bg-card/30 border border-border rounded-xl divide-y divide-border">
        {recentEntries.map((entry) => {
          const task = getTask(entry.taskId);
          const member = getMember(entry.memberId);
          const memberName = member?.name || "Unknown";
          const points = (task?.points || 0) * entry.quantity;
          const taskName = task?.name || "Unknown Task";
          const isEditing = editingEntry?.id === entry.id;

          if (isEditing && editingEntry) {
            return (
              <div
                key={entry.id}
                className="px-5 py-4 bg-card/50"
              >
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-muted mb-1.5">Member</label>
                    <select
                      value={editingEntry.memberId}
                      onChange={(e) =>
                        setEditingEntry({ ...editingEntry, memberId: e.target.value })
                      }
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer"
                    >
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-muted mb-1.5">Task</label>
                    <select
                      value={editingEntry.taskId}
                      onChange={(e) =>
                        setEditingEntry({ ...editingEntry, taskId: e.target.value })
                      }
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer"
                    >
                      {tasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (+{t.points})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <label className="block text-xs text-muted mb-1.5">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={editingEntry.quantity}
                      onChange={(e) =>
                        setEditingEntry({
                          ...editingEntry,
                          quantity: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-crimson transition-colors text-center"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSave}
                      className="px-3 py-2 bg-crimson text-white text-sm font-medium rounded-md hover:bg-crimson-dark transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-2 bg-card border border-border text-muted text-sm font-medium rounded-md hover:text-foreground hover:border-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={entry.id}
              className="group flex items-center justify-between px-5 py-4 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Que
                  fill={member?.color || "#737373"}
                  face={member?.face}
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {memberName}
                    </span>
                    <span className="text-muted">completed</span>
                    <span className="text-foreground">
                      {taskName}
                      {entry.quantity > 1 && (
                        <span className="text-muted"> ×{entry.quantity}</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {formatTimeAgo(entry.timestamp)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(onUpdate || onDelete) && (
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {onUpdate && (
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-card rounded transition-colors"
                        title="Edit entry"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="p-1.5 text-muted hover:text-crimson hover:bg-crimson/10 rounded transition-colors"
                        title="Delete entry"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                <div className="text-crimson font-semibold whitespace-nowrap">
                  +{points} pts
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > limit && (
        <div className="text-center text-xs text-muted mt-4">
          Showing {limit} of {entries.length} entries
        </div>
      )}
    </div>
  );
}
