"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { tasks } from "@/lib/data";
import { PointEntry, TeamMember, DAILY_BONUS_POINTS } from "@/lib/types";
import { loadEntries, addEntry, deleteEntry, updateEntry, restoreEntry } from "@/lib/storage";
import { loadUsers, upsertUser } from "@/lib/users";
import { supabase } from "@/lib/supabase";
import { getWeekStart, isInWeek } from "@/lib/dates";
import { WeeklyLeaderboard, TimePeriod } from "@/components/WeeklyLeaderboard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ToastContainer, ToastData } from "@/components/Toast";
import { SignOutButton } from "@/components/SignOutButton";
import {
  LeaderboardSkeleton,
  ActivitySkeleton,
} from "@/components/Skeleton";
import { SearchableTaskSelect } from "@/components/SearchableTaskSelect";
import { Que } from "@/components/Que";
import { ProfileSettings } from "@/components/ProfileSettings";
import { LastWeekWinner } from "@/components/LastWeekWinner";

export default function Home() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [entries, setEntries] = useState<PointEntry[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [customTaskName, setCustomTaskName] = useState("");
  const [customTaskPoints, setCustomTaskPoints] = useState(10);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastEntry, setLastEntry] = useState<{ memberName: string; taskName: string; points: number; quantity: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const previousLeaderRef = useRef<string | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Load entries and users from database on mount
  useEffect(() => {
    async function loadData() {
      const [storedEntries, storedUsers] = await Promise.all([
        loadEntries(),
        loadUsers(),
      ]);
      setEntries(storedEntries);
      setUsers(storedUsers);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // Real-time subscriptions for live updates
  useEffect(() => {
    // Subscribe to entries changes
    const entriesChannel = supabase
      .channel("entries-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entries" },
        async () => {
          const updatedEntries = await loadEntries();
          setEntries(updatedEntries);
        }
      )
      .subscribe();

    // Subscribe to users changes (profile updates)
    const usersChannel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        async () => {
          const updatedUsers = await loadUsers();
          setUsers(updatedUsers);
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(entriesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  // Auto-register user when they sign in
  useEffect(() => {
    async function registerUser() {
      if (status === "authenticated" && session?.user?.email) {
        const currentUser: TeamMember = {
          id: session.user.email,
          name: session.user.name || session.user.email.split("@")[0],
          avatar: session.user.image || undefined,
        };
        const updatedUsers = await upsertUser(currentUser);
        setUsers(updatedUsers);
      }
    }
    registerUser();
  }, [session, status]);

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
        const taskPoints = task?.points || entry.customTaskPoints || 0;
        const basePoints = taskPoints * entry.quantity;
        const bonus = entry.dailyBonus ? DAILY_BONUS_POINTS : 0;
        return total + basePoints + bonus;
      }, 0);
  };

  // Get current leader (member with most points)
  const getCurrentLeader = useCallback((entriesList: PointEntry[]) => {
    const weekStartDate = getWeekStart();
    const relevantEntries = timePeriod === "week"
      ? entriesList.filter((entry) => isInWeek(entry.timestamp, weekStartDate))
      : entriesList;

    let maxPoints = 0;
    let leader: string | null = null;

    users.forEach((member) => {
      const points = relevantEntries
        .filter((entry) => entry.memberId === member.id)
        .reduce((total, entry) => {
          const task = tasks.find((t) => t.id === entry.taskId);
          const taskPoints = task?.points || entry.customTaskPoints || 0;
          const basePoints = taskPoints * entry.quantity;
          const bonus = entry.dailyBonus ? DAILY_BONUS_POINTS : 0;
          return total + basePoints + bonus;
        }, 0);

      if (points > maxPoints) {
        maxPoints = points;
        leader = member.id;
      }
    });

    return { leaderId: leader, points: maxPoints };
  }, [timePeriod, users]);

  // Show toast
  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  // Dismiss toast
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check for leader change and show celebration
  const checkLeaderChange = useCallback((newEntries: PointEntry[]) => {
    const { leaderId, points } = getCurrentLeader(newEntries);

    if (leaderId && points > 0 && previousLeaderRef.current !== null && leaderId !== previousLeaderRef.current) {
      const newLeader = users.find((m) => m.id === leaderId);
      if (newLeader) {
        showToast({
          message: `${newLeader.name} takes the lead!`,
          type: "celebration",
          duration: 4000,
        });
      }
    }

    previousLeaderRef.current = leaderId;
  }, [getCurrentLeader, showToast, users]);

  // Initialize leader tracking after entries load
  useEffect(() => {
    if (isLoaded && entries.length > 0 && previousLeaderRef.current === null) {
      const { leaderId } = getCurrentLeader(entries);
      previousLeaderRef.current = leaderId;
    }
  }, [isLoaded, entries, getCurrentLeader]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUserId = session?.user?.email;
    if (!currentUserId || !selectedTask || quantity < 1) return;

    const isCustom = selectedTask === "custom";
    if (isCustom && (!customTaskName.trim() || customTaskPoints < 1)) return;

    const newEntry: PointEntry = {
      id: Date.now().toString(),
      memberId: currentUserId,
      taskId: selectedTask,
      quantity: quantity,
      timestamp: new Date(),
      ...(isCustom && {
        customTaskName: customTaskName.trim(),
        customTaskPoints: customTaskPoints,
      }),
    };

    const member = users.find((m) => m.id === currentUserId);
    const task = tasks.find((t) => t.id === selectedTask);
    const points = isCustom ? customTaskPoints : (task?.points || 0);
    const totalPoints = points * quantity;

    // Save to database and update state
    const updatedEntries = await addEntry(newEntry);
    setEntries(updatedEntries);

    // Check if leader changed
    checkLeaderChange(updatedEntries);

    setLastEntry({
      memberName: member?.name || "",
      taskName: isCustom ? customTaskName.trim() : (task?.name || ""),
      points: totalPoints,
      quantity: quantity,
    });
    setShowSuccess(true);
    setSelectedTask("");
    setCustomTaskName("");
    setCustomTaskPoints(10);
    setQuantity(1);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteEntry = async (id: string) => {
    // Find the entry before deleting
    const entryToDelete = entries.find((e) => e.id === id);
    if (!entryToDelete) return;

    const member = users.find((m) => m.id === entryToDelete.memberId);
    const task = tasks.find((t) => t.id === entryToDelete.taskId);
    const taskName = task?.name || entryToDelete.customTaskName || "Unknown Task";

    // Delete immediately
    const updatedEntries = await deleteEntry(id);
    setEntries(updatedEntries);

    // Check if leader changed
    checkLeaderChange(updatedEntries);

    // Show undo toast
    showToast({
      message: `Deleted ${member?.name}'s ${taskName}`,
      type: "undo",
      duration: 5000,
      action: {
        label: "Undo",
        onClick: async () => {
          // Restore the entry
          const restored = await restoreEntry(entryToDelete);
          setEntries(restored);
          checkLeaderChange(restored);
        },
      },
    });
  };

  const handleUpdateEntry = async (id: string, updates: Partial<Omit<PointEntry, "id">>) => {
    const updatedEntries = await updateEntry(id, updates);
    setEntries(updatedEntries);
  };

  // Calculate total entries for display
  const totalEntries = entries.length;

  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 animate-fade-in relative z-[60]">
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
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-muted hidden sm:block">
            <div className="font-medium text-foreground">Quango Inc</div>
            <div className="text-xs mt-0.5">
              {isLoaded && totalEntries > 0 ? `${totalEntries} entries logged` : "Internal Tool"}
            </div>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              {(() => {
                const currentUser = users.find((u) => u.id === session.user?.email);
                return currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileSettings(!showProfileSettings)}
                      className="group flex items-center gap-2 px-2 py-1.5 -mx-2 rounded-lg hover:bg-card/50 transition-all focus:outline-none focus:ring-2 focus:ring-crimson"
                      title="Customize your Que"
                    >
                      <Que
                        fill={currentUser.color || "#737373"}
                        face={currentUser.face}
                        width={32}
                        height={32}
                      />
                      <span className="text-xs text-muted group-hover:text-foreground transition-colors">Edit</span>
                    </button>
                    {showProfileSettings && (
                      <ProfileSettings
                        user={currentUser}
                        onClose={() => setShowProfileSettings(false)}
                        onSave={(updatedUsers) => setUsers(updatedUsers)}
                      />
                    )}
                  </div>
                ) : null;
              })()}
              <SignOutButton />
            </div>
          )}
        </div>
      </header>

      {/* Last Week's Winner */}
      {isLoaded && (
        <LastWeekWinner
          entries={entries}
          teamMembers={users}
          tasks={tasks}
        />
      )}

      {/* Log Points Form */}
      <section className="mb-10 p-6 bg-card/50 border border-border rounded-xl crimson-glow animate-fade-in stagger-1 relative z-50">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-crimson text-sm font-medium">—— [ 00 ]</span>
          <h2 className="text-lg font-semibold">Log Points</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm text-muted mb-2">Task Completed</label>
            <SearchableTaskSelect
              tasks={tasks}
              value={selectedTask}
              onChange={setSelectedTask}
              customTaskName={customTaskName}
            />
          </div>

          {selectedTask === "custom" && (
            <>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm text-muted mb-2">What did you do?</label>
                <input
                  type="text"
                  value={customTaskName}
                  onChange={(e) => setCustomTaskName(e.target.value)}
                  placeholder="Describe the task..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-crimson transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Points</label>
                <input
                  type="number"
                  min="1"
                  value={customTaskPoints}
                  onChange={(e) => setCustomTaskPoints(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-crimson transition-colors text-center"
                />
              </div>
            </>
          )}

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
            disabled={!selectedTask || (selectedTask === "custom" && !customTaskName.trim())}
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
      <div className="mb-10">
        {isLoaded ? (
          <WeeklyLeaderboard
            entries={entries}
            teamMembers={users}
            tasks={tasks}
            timePeriod={timePeriod}
            onTimePeriodChange={setTimePeriod}
          />
        ) : (
          <LeaderboardSkeleton />
        )}
      </div>

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
            {[...users]
              .sort((a, b) => getPointsForMember(b.id) - getPointsForMember(a.id))
              .map((member, index) => {
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
                    <Que
                      fill={member.color || "#737373"}
                      face={member.face}
                      width={28}
                      height={28}
                    />
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
            {[...tasks].sort((a, b) => b.points - a.points).map((task) => (
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
      <div className="mt-10">
        {isLoaded ? (
          <ActivityFeed
            entries={entries}
            teamMembers={users}
            tasks={tasks}
            currentUserId={session?.user?.email || undefined}
            limit={15}
            onDelete={handleDeleteEntry}
            onUpdate={handleUpdateEntry}
          />
        ) : (
          <ActivitySkeleton />
        )}
      </div>

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

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
