"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PointEntry, TeamMember, Task } from "@/lib/types";
import { getWeekStart, getWeekDays, formatDayShort, isInWeek, isUpToToday } from "@/lib/dates";

export type TimePeriod = "week" | "all";

interface WeeklyLeaderboardProps {
  entries: PointEntry[];
  teamMembers: TeamMember[];
  tasks: Task[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

// Colors for each team member (crimson variations + complementary)
const MEMBER_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  "#C41E3A", // Crimson
  "#E85D75", // Light crimson
  "#4ECDC4", // Teal (contrast)
  "#FFE66D", // Yellow (contrast)
  "#8B1538", // Dark crimson
  "#FF6B6B", // Coral
];

type ViewMode = "line" | "bar";

export function WeeklyLeaderboard({
  entries,
  teamMembers,
  tasks,
  timePeriod,
  onTimePeriodChange,
}: WeeklyLeaderboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("line");

  // Assign colors to members
  teamMembers.forEach((member, index) => {
    MEMBER_COLORS[member.id] = COLOR_PALETTE[index % COLOR_PALETTE.length];
  });

  // Get task points by ID
  const getTaskPoints = (taskId: string): number => {
    return tasks.find((t) => t.id === taskId)?.points || 0;
  };

  // Filter entries based on time period
  const weekStart = getWeekStart();
  const filteredEntries = useMemo(() => {
    if (timePeriod === "week") {
      return entries.filter((entry) => isInWeek(entry.timestamp, weekStart));
    }
    return entries; // All time
  }, [entries, weekStart, timePeriod]);

  // Get the date range for all entries
  const dateRange = useMemo(() => {
    if (entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return {
      start: sorted[0].timestamp,
      end: sorted[sorted.length - 1].timestamp,
    };
  }, [entries]);

  // Prepare line chart data for weekly view (cumulative points per day)
  const weeklyLineChartData = useMemo(() => {
    const weekDays = getWeekDays();
    const weekEntries = entries.filter((entry) => isInWeek(entry.timestamp, weekStart));

    return weekDays
      .filter(isUpToToday)
      .map((day) => {
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const dataPoint: Record<string, string | number> = {
          day: formatDayShort(day),
        };

        teamMembers.forEach((member) => {
          const cumulativePoints = weekEntries
            .filter((entry) => entry.memberId === member.id && entry.timestamp <= dayEnd)
            .reduce((sum, entry) => sum + getTaskPoints(entry.taskId) * entry.quantity, 0);
          dataPoint[member.name] = cumulativePoints;
        });

        return dataPoint;
      });
  }, [entries, teamMembers, tasks, weekStart]);

  // Prepare line chart data for all time view (by week)
  const allTimeLineChartData = useMemo(() => {
    if (entries.length === 0) return [];

    const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstEntry = sorted[0].timestamp;
    const now = new Date();

    // Generate weeks from first entry to now
    const weeks: { start: Date; label: string }[] = [];
    let currentWeekStart = getWeekStart(firstEntry);

    while (currentWeekStart <= now) {
      weeks.push({
        start: new Date(currentWeekStart),
        label: currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // Limit to last 12 weeks if there are many
    const displayWeeks = weeks.length > 12 ? weeks.slice(-12) : weeks;

    return displayWeeks.map((week) => {
      const weekEnd = new Date(week.start);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const dataPoint: Record<string, string | number> = {
        day: week.label,
      };

      teamMembers.forEach((member) => {
        const cumulativePoints = entries
          .filter((entry) => entry.memberId === member.id && entry.timestamp < weekEnd)
          .reduce((sum, entry) => sum + getTaskPoints(entry.taskId) * entry.quantity, 0);
        dataPoint[member.name] = cumulativePoints;
      });

      return dataPoint;
    });
  }, [entries, teamMembers, tasks]);

  // Select appropriate line chart data
  const lineChartData = timePeriod === "week" ? weeklyLineChartData : allTimeLineChartData;

  // Prepare bar chart data (total points per member, sorted)
  const barChartData = useMemo(() => {
    return teamMembers
      .map((member) => {
        const totalPoints = filteredEntries
          .filter((entry) => entry.memberId === member.id)
          .reduce((sum, entry) => sum + getTaskPoints(entry.taskId) * entry.quantity, 0);

        return {
          name: member.name,
          avatar: member.avatar,
          points: totalPoints,
          fill: MEMBER_COLORS[member.id],
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [filteredEntries, teamMembers, tasks]);

  // Custom X-axis tick with avatar for bar chart
  const AvatarAxisTick = ({ x, y, payload }: any) => {
    const member = barChartData.find((d) => d.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        {member?.avatar ? (
          <foreignObject x={-14} y={4} width={28} height={28}>
            <Image
              src={member.avatar}
              alt={member.name}
              width={28}
              height={28}
              className="rounded-full object-cover"
              style={{ borderRadius: "50%" }}
            />
          </foreignObject>
        ) : (
          <circle cx={0} cy={18} r={14} fill="#141414" stroke="#262626" />
        )}
      </g>
    );
  };

  // Custom legend with avatars for line chart
  const AvatarLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 pt-3">
      {teamMembers.map((member) => (
        <div key={member.id} className="flex items-center gap-2">
          {member.avatar ? (
            <Image
              src={member.avatar}
              alt={member.name}
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: MEMBER_COLORS[member.id] }}
            />
          )}
          <span className="text-xs text-muted">{member.name}</span>
          <div
            className="w-3 h-0.5 rounded"
            style={{ backgroundColor: MEMBER_COLORS[member.id] }}
          />
        </div>
      ))}
    </div>
  );

  // Custom tooltip for dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value} pts
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-xs text-crimson">
            {data.points} pts {timePeriod === "week" ? "this week" : "all time"}
          </p>
        </div>
      );
    }
    return null;
  };

  const hasData = filteredEntries.length > 0;

  return (
    <div className="animate-fade-in stagger-4">
      {/* Header with toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-muted text-sm font-medium">—— [ 01 ]</span>
          <h2 className="text-lg font-semibold">Leaderboard</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Period Toggle */}
          <div className="flex bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => onTimePeriodChange("week")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                timePeriod === "week"
                  ? "bg-crimson text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => onTimePeriodChange("all")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                timePeriod === "all"
                  ? "bg-crimson text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              All Time
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode("line")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                viewMode === "line"
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setViewMode("bar")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                viewMode === "bar"
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Totals
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-card/30 border border-border rounded-xl p-6">
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-muted">
            {timePeriod === "week"
              ? "No points logged this week yet"
              : "No points logged yet"}
          </div>
        ) : viewMode === "line" ? (
          /* Line Chart - Progress Over Time */
          <div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="day"
                    stroke="#737373"
                    tick={{ fill: "#737373", fontSize: 11 }}
                    axisLine={{ stroke: "#262626" }}
                    interval={timePeriod === "all" ? "preserveStartEnd" : 0}
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fill: "#737373", fontSize: 12 }}
                    axisLine={{ stroke: "#262626" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {teamMembers.map((member) => (
                    <Line
                      key={member.id}
                      type="monotone"
                      dataKey={member.name}
                      stroke={MEMBER_COLORS[member.id]}
                      strokeWidth={2}
                      dot={{ fill: MEMBER_COLORS[member.id], r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <AvatarLegend />
          </div>
        ) : (
          /* Bar Chart - Total Points */
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#737373"
                  tick={<AvatarAxisTick />}
                  axisLine={{ stroke: "#262626" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#737373"
                  tick={{ fill: "#737373", fontSize: 12 }}
                  axisLine={{ stroke: "#262626" }}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar
                  dataKey="points"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Period indicator */}
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted">
          <span>
            {timePeriod === "week" ? (
              <>Week of {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
            ) : dateRange ? (
              <>
                {dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" — "}
                {dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </>
            ) : (
              "All time"
            )}
          </span>
          <span>
            {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
            {timePeriod === "week" ? " this week" : " total"}
          </span>
        </div>
      </div>
    </div>
  );
}
