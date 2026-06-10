'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTier } from '@/lib/gamification';

export function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'alltime' | 'weekly' | 'monthly'>(
    'alltime'
  );

  useEffect(() => {
    const field =
      filter === 'alltime'
        ? 'xp'
        : filter === 'weekly'
          ? 'weeklyXP'
          : 'monthlyXP';
    getDocs(
      query(collection(db, 'users'), orderBy(field, 'desc'), limit(20))
    ).then((snap) =>
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [filter]);
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['alltime', 'weekly', 'monthly'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded-full text-sm capitalize
              ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {users.map((u, i) => {
          const tier = getTier(u.xp ?? 0);
          return (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl"
            >
              <span className="text-gray-400 w-6 text-center font-mono">
                #{i + 1}
              </span>
              <img
                src={u.photoURL ?? '/default-avatar.png'}
                className="w-8 h-8 rounded-full"
              />
              <span className="flex-1 font-medium">
                {u.displayName ?? 'Anonymous'}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ color: tier.color, border: `1px solid ${tier.color}` }}
              >
                {tier.name}
              </span>
              <span className="text-yellow-400 font-bold text-sm">
                {u.xp ?? 0} XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}