import { Timestamp } from "firebase/firestore";

export function calculateStreak(activityDates: string[]): number {
  const sorted = [...new Set(activityDates)].sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const dateStr of sorted) {
    const d = new Date(dateStr);
    const diff = Math.floor((current.getTime() - d.getTime()) / 86400000);
    if (diff === 0 || diff === 1) { streak++; current = d; }
    else break;
  }
  return streak;
}

export function todayString() {
  return new Date().toISOString().split("T")[0]; // "2026-06-01"
}
