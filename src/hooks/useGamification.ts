import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase"; // your existing firebase init
import { todayString } from "@/lib/streaks";
import { XP_VALUES } from "@/lib/gamification";

export function useGamification(userId: string) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, "members", userId)).then(snap => setProfile(snap.data()));
  }, [userId]);

  async function awardXP(action: keyof typeof XP_VALUES) {
    const xp = XP_VALUES[action];
    const ref = doc(db, "members", userId);
    await updateDoc(ref, {
      points: increment(xp),
      activityDates: arrayUnion(todayString()),
    });
  }

  return { profile, awardXP };
}
