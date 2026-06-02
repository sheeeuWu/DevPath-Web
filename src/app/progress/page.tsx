import { StreakCalendar } from "@/components/gamification/StreakCalendar";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { XPBar } from "@/components/gamification/XPBar";
import { Leaderboard } from "@/components/gamification/Leaderboard";

// This would get real data from auth + firestore
export default function ProgressPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold">Your Progress</h1>
      <section>
        <h2 className="text-lg font-semibold mb-3">🔥 Learning Streak</h2>
        <StreakCalendar activityDates={[]} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">⚡ XP & Tier</h2>
        <XPBar xp={0} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">🏅 Badges</h2>
        <BadgeGrid earned={[]} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">🏆 Leaderboard</h2>
        <Leaderboard />
      </section>
    </main>
  );
}
