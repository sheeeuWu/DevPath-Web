"use client";
import { useMemo } from "react";

export function StreakCalendar({ activityDates }: { activityDates: string[] }) {
  const dateSet = useMemo(() => new Set(activityDates), [activityDates]);
  
  // Last 52 weeks
  const weeks = useMemo(() => {
    const cells: { date: string; active: boolean }[][] = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 363);

    let week: typeof cells[0] = [];
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const str = d.toISOString().split("T")[0];
      week.push({ date: str, active: dateSet.has(str) });
      if (week.length === 7) { cells.push(week); week = []; }
    }
    if (week.length) cells.push(week);
    return cells;
  }, [dateSet]);

  return (
    <div className="flex gap-1 overflow-x-auto py-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map(({ date, active }) => (
            <div
              key={date}
              title={date}
              className={`w-3 h-3 rounded-sm ${active ? "bg-green-500" : "bg-gray-700"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
