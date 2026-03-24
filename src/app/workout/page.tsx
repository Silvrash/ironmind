'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Calendar, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkoutSessions, createWorkoutSession } from '@/lib/firestore';
import { getNextWorkoutDay } from '@/lib/ai-coach';
import { WORKOUT_DAYS } from '@/lib/workout-data';
import { AppShell } from '@/components/Navigation';
import WorkoutCard from '@/components/WorkoutCard';
import { Button } from '@/components/ui/button';
import type { WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';

export default function WorkoutPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [starting, setStarting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !userProfile) return;
    const load = async () => {
      const recent = await getWorkoutSessions(user.uid, 6);
      setSessions(recent);
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
  const allWorkouts = WORKOUT_DAYS[planVariant] ?? [];

  const handleStartWorkout = async () => {
    if (!todayWorkout || !user) return;
    setStarting(true);
    try {
      const sessionId = crypto.randomUUID();
      const today = new Date().toISOString().split('T')[0];

      const exercises: ExerciseLog[] = todayWorkout.exercises.map((exercise) => {
        const targetSets = exercise.setsMin;
        const sets: SetLog[] = Array.from({ length: targetSets }, (_, i) => ({
          setNumber: i + 1,
          reps: exercise.repsMax,
          weight: 0,
          completed: false,
        }));
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets,
          personalRecord: false,
        };
      });

      const session: WorkoutSession = {
        id: sessionId,
        userId: user.uid,
        date: today,
        dayNumber: todayWorkout.dayNumber,
        dayName: todayWorkout.name,
        exercises,
        completed: false,
        durationMinutes: 0,
        totalVolume: 0,
        pumpScore: 0,
        createdAt: new Date().toISOString(),
      };

      await createWorkoutSession(session);
      router.push(`/workout/${sessionId}`);
    } catch {
      toast.error('Failed to start workout. Please try again.');
      setStarting(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Workout</h1>
        <p className="text-zinc-500 text-sm mt-1">Champions don't skip days.</p>
      </div>

      {/* Today's Workout */}
      {todayWorkout && (
        <div className="mb-8">
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3">Up Next</h2>
          <WorkoutCard
            workoutDay={todayWorkout}
            actionLabel={starting ? 'Starting...' : 'Start Workout'}
            onAction={handleStartWorkout}
          />
        </div>
      )}

      {/* Full Program */}
      <div className="mb-6">
        <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3">
          Your Program — {planVariant.charAt(0).toUpperCase() + planVariant.slice(1)} Split
        </h2>
        <div className="space-y-3">
          {allWorkouts.map((day) => (
            <WorkoutCard
              key={day.dayNumber}
              workoutDay={day}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div>
          <h2 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm text-zinc-200">{session.dayName}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">
                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-400">{session.pumpScore}% pump</div>
                    <div className="text-xs text-zinc-600">{session.durationMinutes}m</div>
                  </div>
                </div>
                {session.totalVolume > 0 && (
                  <div className="mt-2 text-xs text-zinc-600">
                    {Math.round(session.totalVolume).toLocaleString()} kg total volume
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {dataLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </AppShell>
  );
}
