// Core XP values and badge definitions
export const XP_VALUES = {
  COURSE_COMPLETED: 100,
  EVENT_ATTENDED: 50,
  OPEN_SOURCE_CONTRIBUTION: 150,
  COMMUNITY_HELP: 30,
  DAILY_LOGIN: 10,
};

export const BADGES = [
  { id: "first_course", label: "First Course Completed", icon: "🎓", xpRequired: 100 },
  { id: "streak_7",     label: "7-Day Streak",           icon: "🔥", condition: "streak" },
  { id: "oss_contrib",  label: "Open Source Contributor", icon: "💻", xpRequired: 150 },
  { id: "helper",       label: "Community Helper",        icon: "🤝", xpRequired: 300 },
];

export const TIERS = [
  { name: "Bronze",   min: 0,    color: "#cd7f32" },
  { name: "Silver",   min: 500,  color: "#c0c0c0" },
  { name: "Gold",     min: 1500, color: "#ffd700" },
  { name: "Platinum", min: 3000, color: "#e5e4e2" },
];

export function getTier(xp: number) {
  return [...TIERS].reverse().find(t => xp >= t.min) ?? TIERS[0];
}
