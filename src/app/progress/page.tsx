'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, TrendingUp, Flame, Dumbbell, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkoutSessions, getPersonalRecords } from '@/lib/firestore';
import { AppShell } from '@/components/Navigation';
import { getBadges } from '@/lib/ai-coach';
import { MUSCLE_GROUP_COLORS } from '@/lib/workout-data';
import type { WorkoutSession, PersonalRecord, MuscleGroup } from '@/lib/types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProgressPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [recentSessions, personalRecords] = await Promise.all([
        getWorkoutSessions(user.uid, 20),
        getPersonalRecords(user.uid),
      ]);
      setSessions(recentSessions);
      setPrs(personalRecords);
      setDataLoading(false);
    };
    load();
  }, [user]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const badges = getBadges(userProfile.totalWorkouts, userProfile.streak, userProfile.level_points);

  // Muscle group frequency
  const muscleFrequency: Record<string, number> = {};
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const completedSets = ex.sets.filter(s => s.completed).length;
      if (completedSets > 0) {
        // look up muscle group from exercise id if possible
        muscleFrequency[ex.exerciseId] = (muscleFrequency[ex.exerciseId] || 0) + completedSets;
      }
    }
  }

  // Weekly volume trend (last 4 weeks)
  const weeklyVolumes: { week: string; volume: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weekVol = sessions
      .filter(s => s.date >= weekStartStr && s.date <= weekEndStr && s.completed)
      .reduce((sum, s) => sum + s.totalVolume, 0);

    weeklyVolumes.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: weekVol,
    });
  }

  const maxVol = Math.max(...weeklyVolumes.map(w => w.volume), 1);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Progress</h1>
        <p className="text-zinc-500 text-sm mt-1">Track your gains. Champions measure everything.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Workouts</span>
          </div>
          <div className="text-3xl font-black text-yellow-400">{userProfile.totalWorkouts}</div>
        </div>
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Best Streak</span>
          </div>
          <div className="text-3xl font-black text-orange-400">{userProfile.streak} days</div>
        </div>
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Volume</span>
          </div>
          <div className="text-2xl font-black text-green-400">
            {Math.round(sessions.reduce((s, sess) => s + sess.totalVolume, 0) / 1000)}k kg
          </div>
        </div>
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Personal Records</span>
          </div>
          <div className="text-3xl font-black text-indigo-400">{prs.length}</div>
        </div>
      </div>

      {/* Weekly Volume Chart */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 mb-6">
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-4">Weekly Volume</h2>
        <div className="flex items-end gap-3 h-24">
          {weeklyVolumes.map((week) => (
            <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-zinc-600 font-medium">
                {week.volume > 0 ? `${Math.round(week.volume / 1000)}k` : '0'}
              </div>
              <div className="w-full bg-zinc-800 rounded-sm relative" style={{ height: '60px' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-sm transition-all"
                  style={{ height: `${(week.volume / maxVol) * 60}px` }}
                />
              </div>
              <div className="text-xs text-zinc-700 text-center leading-tight">{week.week}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Records */}
      {prs.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Personal Records
          </h2>
          <div className="space-y-2">
            {prs.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName)).map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-200">{pr.exerciseName}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{formatDate(pr.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-yellow-400">{pr.weight} kg</div>
                  <div className="text-xs text-zinc-600">{pr.reps} reps</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Session History
          </h2>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{session.dayName}</div>
                    <div className="text-xs text-zinc-600">{formatDate(session.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-400">{session.pumpScore}%</div>
                    <div className="text-xs text-zinc-600">{session.durationMinutes}m</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{session.exercises.length} exercises</span>
                  <span>{Math.round(session.totalVolume).toLocaleString()} kg volume</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="mb-6">
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3">All Badges</h2>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`border rounded-xl p-3 flex items-start gap-2 transition-opacity ${
                badge.earned
                  ? 'bg-zinc-900/50 border-zinc-700'
                  : 'bg-zinc-900/20 border-zinc-800/50 opacity-40'
              }`}
            >
              <span className="text-xl">{badge.icon}</span>
              <div>
                <div className="text-sm font-semibold text-zinc-200">{badge.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dataLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!dataLoading && sessions.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No workouts yet. Get to the gym!</p>
        </div>
      )}
    </AppShell>
  );
}
