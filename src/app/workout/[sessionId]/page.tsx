'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Timer, Trophy, Flame, Dumbbell, X } from 'lucide-react';
import { toast } from 'sonner';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { updatePersonalRecord, getPersonalRecords, updateUserProfile } from '@/lib/firestore';
import { getPumpScore, calculateTotalVolume } from '@/lib/ai-coach';
import { getRandomArnoldQuote, EXERCISES } from '@/lib/workout-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WorkoutSession, SetLog, ExerciseLog, PersonalRecord } from '@/lib/types';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  const pct = (remaining / seconds) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-indigo-400" />
          <span className="text-indigo-400 font-semibold">Rest Period</span>
        </div>
        <div className="text-6xl font-black text-zinc-100 mb-4 tabular-nums">
          {formatTime(remaining)}
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-zinc-500 text-sm mb-6 italic">
          "{getRandomArnoldQuote().slice(0, 80)}..."
        </p>
        <Button
          onClick={onDone}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          Skip Rest
        </Button>
      </div>
    </div>
  );
}

function CompletionScreen({
  session,
  onClose,
}: {
  session: WorkoutSession;
  onClose: () => void;
}) {
  const quote = getRandomArnoldQuote();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Workout Complete!</h1>
        <p className="text-zinc-500 mb-8">Arnold would be proud.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl font-black text-indigo-400">{session.pumpScore}%</div>
            <div className="text-xs text-zinc-600 mt-1">Pump Score</div>
          </div>
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl font-black text-green-400">{session.durationMinutes}m</div>
            <div className="text-xs text-zinc-600 mt-1">Duration</div>
          </div>
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl font-black text-yellow-400">
              {Math.round(session.totalVolume).toLocaleString()}
            </div>
            <div className="text-xs text-zinc-600 mt-1">kg Volume</div>
          </div>
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl font-black text-orange-400">
              {session.exercises.filter(e => e.personalRecord).length}
            </div>
            <div className="text-xs text-zinc-600 mt-1">New PRs</div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6 text-left">
          <div className="text-xs text-zinc-600 mb-1 uppercase tracking-wider font-medium">Arnold Says</div>
          <p className="text-sm text-zinc-400 italic">"{quote}"</p>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function ActiveWorkoutPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { user, userProfile, updateProfile } = useAuth();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [showCompletion, setShowCompletion] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<Date>(new Date());

  // Load session
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const docRef = doc(db, 'workoutSessions', sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkoutSession;
        setSession(data);
        if (data.completed) {
          setShowCompletion(true);
        }
      } else {
        toast.error('Session not found.');
        router.push('/workout');
      }
      setLoading(false);
    };
    load();
  }, [user, sessionId, router]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateSessionInFirestore = useCallback(async (updatedSession: WorkoutSession) => {
    const docRef = doc(db, 'workoutSessions', sessionId);
    await updateDoc(docRef, updatedSession as unknown as Record<string, unknown>);
  }, [sessionId]);

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof SetLog, value: number | boolean) => {
    if (!session) return;
    const updated = { ...session };
    updated.exercises = session.exercises.map((ex, ei) => {
      if (ei !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, si) => {
          if (si !== setIndex) return s;
          return { ...s, [field]: value };
        }),
      };
    });
    setSession(updated);
  };

  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    if (!session) return;
    const exercise = session.exercises[exerciseIndex];
    const set = exercise.sets[setIndex];

    if (set.completed) {
      // Uncomplete
      handleSetChange(exerciseIndex, setIndex, 'completed', false);
      return;
    }

    // Mark completed
    handleSetChange(exerciseIndex, setIndex, 'completed', true);

    // Show rest timer
    const exerciseData = EXERCISES[exercise.exerciseId];
    const rest = exerciseData?.restSeconds ?? 60;
    setRestDuration(rest);

    // Check if all sets in exercise are done
    const allCompleted = exercise.sets.every((s, si) => si === setIndex || s.completed);
    if (!allCompleted) {
      setShowRestTimer(true);
    }

    // Persist to Firestore
    const updatedSession = {
      ...session,
      exercises: session.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) => si === setIndex ? { ...s, completed: true } : s),
        };
      }),
    };
    await updateSessionInFirestore(updatedSession);
    setSession(updatedSession);
  };

  const handleFinishWorkout = async () => {
    if (!session || !user || !userProfile) return;

    const durationMinutes = Math.round(elapsedSeconds / 60);
    const totalVolume = calculateTotalVolume(session);
    const pumpScore = getPumpScore({ ...session, totalVolume });

    // Check PRs
    let personalRecords: PersonalRecord[] = [];
    try {
      personalRecords = await getPersonalRecords(user.uid);
    } catch {
      // continue without PR check
    }

    const updatedExercises = await Promise.all(
      session.exercises.map(async (ex) => {
        const completedSets = ex.sets.filter(s => s.completed && s.weight > 0);
        if (completedSets.length === 0) return ex;

        const maxWeight = Math.max(...completedSets.map(s => s.weight));
        const maxReps = completedSets.find(s => s.weight === maxWeight)?.reps ?? 0;
        const existingPR = personalRecords.find(pr => pr.exerciseId === ex.exerciseId);

        let isNewPR = false;
        if (!existingPR || maxWeight > existingPR.weight || (maxWeight === existingPR.weight && maxReps > existingPR.reps)) {
          isNewPR = true;
          try {
            await updatePersonalRecord(user.uid, {
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              weight: maxWeight,
              reps: maxReps,
              date: session.date,
            });
          } catch {
            // continue
          }
        }
        return { ...ex, personalRecord: isNewPR };
      })
    );

    const completedSession: WorkoutSession = {
      ...session,
      exercises: updatedExercises,
      completed: true,
      durationMinutes,
      totalVolume,
      pumpScore,
    };

    await updateSessionInFirestore(completedSession);
    setSession(completedSession);

    // Update user stats
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = userProfile.lastWorkoutDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newStreak = lastWorkout === yesterdayStr || lastWorkout === today
      ? userProfile.streak + 1
      : 1;

    try {
      await updateProfile({
        streak: newStreak,
        lastWorkoutDate: today,
        totalWorkouts: userProfile.totalWorkouts + 1,
        level_points: userProfile.level_points + Math.round(pumpScore / 10) + 10,
      });
    } catch {
      // non-critical
    }

    const newPRs = updatedExercises.filter(e => e.personalRecord).length;
    if (newPRs > 0) {
      toast.success(`${newPRs} new personal record${newPRs > 1 ? 's' : ''}! 🏆`);
    }

    setShowCompletion(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  if (showCompletion) {
    return (
      <CompletionScreen
        session={session}
        onClose={() => router.push('/dashboard')}
      />
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const exerciseData = EXERCISES[currentExercise.exerciseId];
  const completedSetsCount = currentExercise.sets.filter(s => s.completed).length;
  const totalSetsCount = currentExercise.sets.length;
  const allExercisesProgress = session.exercises.map(ex => ({
    name: ex.exerciseName,
    done: ex.sets.filter(s => s.completed).length,
    total: ex.sets.length,
  }));
  const overallCompleted = allExercisesProgress.reduce((sum, ex) => sum + ex.done, 0);
  const overallTotal = allExercisesProgress.reduce((sum, ex) => sum + ex.total, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {showRestTimer && (
        <RestTimer
          seconds={restDuration}
          onDone={() => setShowRestTimer(false)}
        />
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/workout')}
            className="text-zinc-500 hover:text-zinc-300 p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-200">{session.dayName}</div>
            <div className="text-xs text-zinc-600">{formatTime(elapsedSeconds)}</div>
          </div>
          <div className="text-xs text-zinc-500 text-right">
            {overallCompleted}/{overallTotal} sets
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="max-w-2xl mx-auto mt-2">
          <div className="w-full bg-zinc-800 rounded-full h-1">
            <div
              className="bg-indigo-500 h-1 rounded-full transition-all"
              style={{ width: overallTotal > 0 ? `${(overallCompleted / overallTotal) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">

        {/* Exercise Navigation Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {session.exercises.map((ex, i) => {
            const done = ex.sets.filter(s => s.completed).length;
            const total = ex.sets.length;
            const isComplete = done === total && total > 0;
            const isCurrent = i === currentExerciseIndex;
            return (
              <button
                key={ex.exerciseId}
                onClick={() => setCurrentExerciseIndex(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isComplete
                    ? 'bg-green-900/40 text-green-400 border border-green-800/50'
                    : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {i + 1}. {ex.exerciseName.split(' ').slice(0, 2).join(' ')}
                {isComplete && ' ✓'}
              </button>
            );
          })}
        </div>

        {/* Current Exercise */}
        <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/30 px-5 py-4 border-b border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">
                  Exercise {currentExerciseIndex + 1} of {session.exercises.length}
                </div>
                <h2 className="text-xl font-black tracking-tight">{currentExercise.exerciseName}</h2>
                {exerciseData && (
                  <p className="text-zinc-500 text-xs mt-1">{exerciseData.description}</p>
                )}
              </div>
              <div className="text-right text-xs text-zinc-500">
                <div className="font-semibold text-lg text-zinc-300">{completedSetsCount}/{totalSetsCount}</div>
                <div>sets</div>
              </div>
            </div>
            {exerciseData?.formTip && (
              <div className="mt-3 bg-zinc-900/50 rounded-lg px-3 py-2 text-xs text-zinc-400">
                <span className="text-yellow-500 font-semibold">Form: </span>
                {exerciseData.formTip}
              </div>
            )}
          </div>

          {/* Sets */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 mb-3 text-xs text-zinc-600 font-medium uppercase tracking-wider">
              <span>Set</span>
              <span>Weight (kg)</span>
              <span>Reps</span>
              <span className="text-center">Done</span>
            </div>
            <div className="space-y-2">
              {currentExercise.sets.map((set, setIndex) => (
                <div
                  key={set.setNumber}
                  className={`grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 items-center rounded-lg p-2 transition-colors ${
                    set.completed ? 'bg-green-950/20 border border-green-900/30' : 'bg-zinc-900/50'
                  }`}
                >
                  <span className={`text-sm font-bold text-center ${set.completed ? 'text-green-500' : 'text-zinc-500'}`}>
                    {set.setNumber}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={set.weight || ''}
                    placeholder="0"
                    onChange={(e) => handleSetChange(currentExerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-zinc-100 text-center text-sm"
                    disabled={set.completed}
                  />
                  <Input
                    type="number"
                    min="0"
                    value={set.reps || ''}
                    placeholder="0"
                    onChange={(e) => handleSetChange(currentExerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-zinc-100 text-center text-sm"
                    disabled={set.completed}
                  />
                  <button
                    onClick={() => handleCompleteSet(currentExerciseIndex, setIndex)}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                      set.completed
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-zinc-700 text-zinc-400 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <button
              onClick={() => {
                if (!session) return;
                const updated = { ...session };
                updated.exercises = session.exercises.map((ex, ei) => {
                  if (ei !== currentExerciseIndex) return ex;
                  const newSet: SetLog = {
                    setNumber: ex.sets.length + 1,
                    reps: ex.sets[ex.sets.length - 1]?.reps ?? 10,
                    weight: ex.sets[ex.sets.length - 1]?.weight ?? 0,
                    completed: false,
                  };
                  return { ...ex, sets: [...ex.sets, newSet] };
                });
                setSession(updated);
              }}
              className="mt-3 w-full text-xs text-zinc-600 hover:text-zinc-400 py-2 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors"
            >
              + Add Set
            </button>
          </div>
        </div>

        {/* Exercise Navigation */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setCurrentExerciseIndex(i => Math.max(0, i - 1))}
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={currentExerciseIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          {currentExerciseIndex < session.exercises.length - 1 ? (
            <Button
              onClick={() => setCurrentExerciseIndex(i => Math.min(session.exercises.length - 1, i + 1))}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Next Exercise
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinishWorkout}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Finish Workout
            </Button>
          )}
        </div>

        {/* Exercise List Overview */}
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-3">All Exercises</div>
          <div className="space-y-2">
            {allExercisesProgress.map((ex, i) => {
              const pct = ex.total > 0 ? (ex.done / ex.total) * 100 : 0;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentExerciseIndex(i)}
                  className={`w-full text-left group ${i === currentExerciseIndex ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className={`font-medium ${i === currentExerciseIndex ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {ex.name}
                    </span>
                    <span className="text-zinc-600">{ex.done}/{ex.total}</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Finish Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-[#0a0a0a]/90 backdrop-blur-sm border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleFinishWorkout}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3"
          >
            <Flame className="w-4 h-4 mr-2" />
            Complete Workout ({overallCompleted}/{overallTotal} sets done)
          </Button>
        </div>
      </div>
    </div>
  );
}
