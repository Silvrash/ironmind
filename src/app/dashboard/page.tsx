'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, TrendingUp, Trophy, Zap, ChevronRight, Star, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkoutSessions, getWeeklyVolume } from '@/lib/firestore';
import { getNextWorkoutDay, getSuggestions, getBadges } from '@/lib/ai-coach';
import { WORKOUT_DAYS } from '@/lib/workout-data';
import { AppShell } from '@/components/Navigation';
import WorkoutCard from '@/components/WorkoutCard';
import type { WorkoutSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !userProfile) {
      router.push('/onboarding');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (!user || !userProfile) return;
    const load = async () => {
      setDataLoading(true);
      const [recentSessions, vol] = await Promise.all([
        getWorkoutSessions(user.uid, 10),
        getWeeklyVolume(user.uid),
      ]);
      setSessions(recentSessions);
      setWeeklyVolume(vol);
      setDataLoading(false);
    };
    load();
  }, [user, userProfile]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planVariant = userProfile.planVariant;
  const lastDayNumber = sessions.length > 0 ? sessions[0].dayNumber : null;
  const nextDayNumber = getNextWorkoutDay(lastDayNumber);
  const todayWorkout = WORKOUT_DAYS[planVariant]?.[nextDayNumber - 1];

  const suggestions = getSuggestions(sessions, todayWorkout?.exercises ?? []);
  const primarySuggestion = suggestions[0];

  const badges = getBadges(userProfile.totalWorkouts, userProfile.streak, userProfile.level_points);
  const earnedBadges = badges.filter(b => b.earned);

  const xpForNextLevel = Math.ceil((userProfile.level_points / 100 + 1)) * 100;
  const xpProgress = (userProfile.level_points % 100);

  const displayName = userProfile.displayName || user?.displayName || 'Champion';

  return (
    <AppShell>
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-zinc-500 text-sm">{getGreeting()}</p>
        <h1 className="text-2xl font-black tracking-tight">
          {displayName} 👊
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">{userProfile.streak}</div>
          <div className="text-xs text-zinc-600 mt-0.5">Day Streak</div>
        </div>
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400">{userProfile.totalWorkouts}</div>
          <div className="text-xs text-zinc-600 mt-0.5">Workouts</div>
        </div>
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-400">
            {weeklyVolume > 0 ? `${Math.round(weeklyVolume / 1000)}k` : '0'}
          </div>
          <div className="text-xs text-zinc-600 mt-0.5">kg This Week</div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold">Level Progress</span>
          </div>
          <span className="text-xs text-zinc-500">{userProfile.level_points} / {xpForNextLevel} XP</span>
        </div>
        <Progress value={(xpProgress / 100) * 100} className="h-2 bg-zinc-800" />
        <p className="text-xs text-zinc-600 mt-1.5">
          {100 - xpProgress} XP to next level
        </p>
      </div>

      {/* Today's Workout */}
      {todayWorkout && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Today's Workout</h2>
            <Link href="/workout" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <WorkoutCard
            workoutDay={todayWorkout}
            actionLabel="Start Workout"
            actionHref="/workout"
          />
        </div>
      )}

      {/* AI Coach Tip */}
      {primarySuggestion && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-950/60 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">
                Coach's Tip
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-2">
                {primarySuggestion.message}
              </p>
              <p className="text-xs text-zinc-600 italic">
                "{primarySuggestion.arnoldQuote.slice(0, 100)}..."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Recent Workouts</h2>
            <Link href="/progress" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-200">{session.dayName}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{formatDate(session.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-400">{session.pumpScore}%</div>
                  <div className="text-xs text-zinc-600">pump</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3">Badges Earned</h2>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2"
                title={badge.description}
              >
                <span>{badge.icon}</span>
                <span className="text-xs font-medium text-zinc-300">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Upsell */}
      {userProfile.subscriptionTier === 'free' && (
        <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/20 border border-indigo-800/40 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Unlock Premium</div>
              <p className="text-xs text-zinc-500 mb-3">
                Advanced analytics, custom splits, and full AI coaching. $9.99/month.
              </p>
              <Link href="/premium">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                  View Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
