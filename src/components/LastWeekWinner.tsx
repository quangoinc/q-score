"use client";

import { useMemo } from "react";
import { PointEntry, TeamMember, Task, DAILY_BONUS_POINTS } from "@/lib/types";
import { getLastWeekStart, isInWeek } from "@/lib/dates";
import { Que } from "@/components/Que";

interface LastWeekWinnerProps {
  entries: PointEntry[];
  teamMembers: TeamMember[];
  tasks: Task[];
}

export function LastWeekWinner({ entries, teamMembers, tasks }: LastWeekWinnerProps) {
  const winner = useMemo(() => {
    const lastWeekStart = getLastWeekStart();

    const lastWeekEntries = entries.filter((entry) =>
      isInWeek(entry.timestamp, lastWeekStart)
    );

    if (lastWeekEntries.length === 0) return null;

    const pointsByMember: Record<string, number> = {};
    for (const entry of lastWeekEntries) {
      const task = tasks.find((t) => t.id === entry.taskId);
      const taskPoints = task?.points || entry.customTaskPoints || 0;
      const basePoints = taskPoints * entry.quantity;
      const bonus = entry.dailyBonus ? DAILY_BONUS_POINTS : 0;
      pointsByMember[entry.memberId] = (pointsByMember[entry.memberId] || 0) + basePoints + bonus;
    }

    let topId = "";
    let topPoints = 0;
    for (const [memberId, points] of Object.entries(pointsByMember)) {
      if (points > topPoints) {
        topId = memberId;
        topPoints = points;
      }
    }

    if (!topId || topPoints === 0) return null;

    const member = teamMembers.find((m) => m.id === topId);
    if (!member) return null;

    // Format the week range for display
    const endOfWeek = new Date(lastWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const weekLabel = `${fmt(lastWeekStart)} – ${fmt(endOfWeek)}`;

    return { member, points: topPoints, weekLabel };
  }, [entries, teamMembers, tasks]);

  if (!winner) return null;

  return (
    <section className="mb-10 relative overflow-hidden rounded-xl border border-crimson/30 bg-gradient-to-br from-crimson/10 via-card/80 to-card/50 animate-fade-in">
      {/* Decorative shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-crimson/5 to-transparent winner-shimmer pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
        {/* Trophy / Avatar area */}
        <div className="relative flex-shrink-0">
          {/* Glow ring behind avatar */}
          <div className="absolute inset-0 rounded-full bg-crimson/20 blur-xl scale-150" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 winner-float">
            <Que
              fill={winner.member.color || "#C41E3A"}
              face={winner.member.face}
              width={96}
              height={96}
              className="w-full h-full drop-shadow-[0_0_12px_rgba(196,30,58,0.4)]"
            />
            {/* Crown */}
            <span className="absolute -top-3 -right-2 text-2xl winner-bounce">👑</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-medium tracking-widest uppercase text-crimson mb-1">
            Last Week&apos;s Champion
          </p>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight-custom">
            {winner.member.name}
          </h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
            <span className="text-crimson font-bold text-lg">{winner.points} pts</span>
            <span className="text-muted text-sm">{winner.weekLabel}</span>
          </div>
          <p className="text-muted text-sm mt-2">
            Scored the most points last week!
          </p>
        </div>

        {/* Decorative stars */}
        <div className="hidden sm:flex flex-col items-center gap-2 text-crimson/40 text-xl select-none">
          <span className="winner-twinkle">✦</span>
          <span className="winner-twinkle" style={{ animationDelay: "0.4s" }}>✦</span>
          <span className="winner-twinkle" style={{ animationDelay: "0.8s" }}>✦</span>
        </div>
      </div>
    </section>
  );
}
