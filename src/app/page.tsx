"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { teamMembers, tasks } from "@/lib/data";
import { PointEntry } from "@/lib/types";
import { loadEntries, addEntry, deleteEntry, updateEntry } from "@/lib/storage";
import { getWeekStart, isInWeek } from "@/lib/dates";
import { WeeklyLeaderboard, TimePeriod } from "@/components/WeeklyLeaderboard";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function Home() {
  const [entries, setEntries] = useState<PointEntry[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastEntry, setLastEntry] = useState<{ memberName: string; taskName: string; points: number; quantity: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = loadEntries();
    setEntries(stored);
    setIsLoaded(true);
  }, []);

  // Filter entries based on time period
  const weekStart = getWeekStart();
  const filteredEntries = useMemo(() => {
    if (timePeriod === "week") {
      return entries.filter((entry) => isInWeek(entry.timestamp, weekStart));
    }
    return entries;
  }, [entries, weekStart, timePeriod]);

  // Calculate points per member based on time period
  const getPointsForMember = (memberId: string) => {
    return filteredEntries
      .filter((entry) => entry.memberId === memberId)
      .reduce((total, entry) => {
        const task = tasks.find((t) => t.id === entry.taskId);
        return total + (task?.points || 0) * entry.quantity;
      }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedTask || quantity < 1) return;

    const newEntry: PointEntry = {
      id: Date.now().toString(),
      memberId: selectedMember,
      taskId: selectedTask,
      quantity: quantity,
      timestamp: new Date(),
    };

    const member = teamMembers.find((m) => m.id === selectedMember);
    const task = tasks.find((t) => t.id === selectedTask);
    const totalPoints = (task?.points || 0) * quantity;

    // Save to localStorage and update state
    const updatedEntries = addEntry(newEntry);
    setEntries(updatedEntries);

    setLastEntry({
      memberName: member?.name || "",
      taskName: task?.name || "",
      points: totalPoints,
      quantity: quantity,
    });
    setShowSuccess(true);
    setSelectedMember("");
    setSelectedTask("");
    setQuantity(1);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = deleteEntry(id);
    setEntries(updatedEntries);
  };

  const handleUpdateEntry = (id: string, updates: Partial<Omit<PointEntry, "id">>) => {
    const updatedEntries = updateEntry(id, updates);
    setEntries(updatedEntries);
  };

  // Calculate total entries for display
  const totalEntries = entries.length;

  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 animate-fade-in">
        <div className="flex items-center gap-4">
          <Image
            src="/white-que.png"
            alt="Quango"
            width={36}
            height={36}
            className="rounded"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight-custom">Q-Score</h1>
            <p className="text-muted text-xs">Team Points Tracker</p>
          </div>
        </div>
        <div className="text-right text-sm text-muted">
          <div className="font-medium text-foreground">Quango Inc</div>
          <div className="text-xs mt-0.5">
            {isLoaded && totalEntries > 0 ? `${totalEntries} entries logged` : "Internal Tool"}
          </div>
        </div>
      </header>

      {/* Log Points Form */}
      <section className="mb-10 p-6 bg-card/50 border border-border rounded-xl crimson-glow animate-fade-in stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-crimson text-sm font-medium">—— [ 00 ]</span>
          <h2 className="text-lg font-semibold">Log Points</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm text-muted mb-2">Team Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select member...</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm text-muted mb-2">Task Completed</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-crimson transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select task...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name} (+{task.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Qty</label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                      quantity === preset
                        ? "bg-crimson text-white"
                        : "bg-background border border-border text-muted hover:text-foreground hover:border-muted"
                    }`}
                  >
                    {preset}×
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-16 bg-background border rounded-lg px-2 py-3 text-foreground focus:outline-none focus:border-crimson transition-colors text-center ${
                  [1, 5, 10].includes(quantity) ? "border-border" : "border-crimson"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedMember || !selectedTask}
            className="px-6 py-3 bg-crimson text-white font-medium rounded-lg hover:bg-crimson-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Add Points
          </button>
        </form>

        {/* Success Message */}
        {showSuccess && lastEntry && (
          <div className="mt-6 px-4 py-3 bg-crimson/10 border border-crimson/30 rounded-lg animate-fade-in">
            <span className="text-crimson font-medium">+{lastEntry.points} pts</span>
            <span className="mx-2 text-muted">·</span>
            <span className="font-medium">{lastEntry.memberName}</span>
            <span className="mx-2 text-muted">·</span>
            <span className="text-muted">
              {lastEntry.taskName}
              {lastEntry.quantity > 1 && ` ×${lastEntry.quantity}`}
            </span>
          </div>
        )}
      </section>

      {/* Leaderboard Charts */}
      {isLoaded && (
        <div className="mb-10">
          <WeeklyLeaderboard
            entries={entries}
            teamMembers={teamMembers}
            tasks={tasks}
            timePeriod={timePeriod}
            onTimePeriodChange={setTimePeriod}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        {/* Team Members Section */}
        <section className="animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm font-medium">—— [ 02 ]</span>
              <h2 className="text-lg font-semibold">Team</h2>
            </div>
            <span className="text-xs text-muted">
              {timePeriod === "week" ? "This Week" : "All Time"}
            </span>
          </div>

          <div className="space-y-1">
            {teamMembers.map((member, index) => {
              const points = getPointsForMember(member.id);
              return (
                <div
                  key={member.id}
                  className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted text-xs font-mono w-5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs text-muted">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{member.name}</span>
                  </div>
                  <span className={points > 0 ? "text-crimson font-semibold" : "text-muted text-sm"}>
                    {points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tasks Section */}
        <section className="animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-muted text-sm font-medium">—— [ 03 ]</span>
            <h2 className="text-lg font-semibold">Tasks</h2>
          </div>

          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-card/50 transition-colors"
              >
                <span className="font-medium">{task.name}</span>
                <span className="text-sm px-3 py-1 bg-card border border-border rounded-full">
                  +{task.points}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Activity Feed */}
      {isLoaded && (
        <div className="mt-10">
          <ActivityFeed
            entries={entries}
            teamMembers={teamMembers}
            tasks={tasks}
            limit={15}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-border flex justify-between items-center text-sm text-muted animate-fade-in stagger-5">
        <div className="flex items-center gap-3">
          <Image
            src="/crimson-que.png"
            alt="Quango"
            width={24}
            height={24}
            className="rounded opacity-60"
          />
          <span>&copy; {new Date().getFullYear()} Quango Inc</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
          <span>v0.1</span>
        </div>
      </footer>
    </main>
  );
}
