import { BADGES } from "@/lib/gamification";

export function BadgeGrid({ earned }: { earned: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGES.map(badge => {
        const unlocked = earned.includes(badge.id);
        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center p-3 rounded-xl border text-center
              ${unlocked ? "border-yellow-500 bg-yellow-500/10" : "border-gray-700 opacity-40 grayscale"}`}
          >
            <span className="text-3xl">{badge.icon}</span>
            <p className="text-xs mt-1 text-gray-300">{badge.label}</p>
          </div>
        );
      })}
    </div>
  );
}
