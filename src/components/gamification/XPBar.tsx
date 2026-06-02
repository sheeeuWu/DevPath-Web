import { getTier } from "@/lib/gamification";

export function XPBar({ xp }: { xp: number }) {
  const tier = getTier(xp);
  const tiers = [0, 500, 1500, 3000, 6000];
  const next = tiers.find(t => t > xp) ?? xp;
  const prev = tiers.filter(t => t <= xp).at(-1) ?? 0;
  const pct = Math.round(((xp - prev) / (next - prev)) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: tier.color }} className="font-bold">{tier.name}</span>
        <span className="text-gray-400">{xp} XP</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: tier.color }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{next - xp} XP to next tier</p>
    </div>
  );
}
