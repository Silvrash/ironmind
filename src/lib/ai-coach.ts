import type { WorkoutSession, Exercise, AICoachSuggestion } from './types';
import { getRandomArnoldQuote } from './workout-data';

export function getNextWorkoutDay(lastDayNumber: number | null): number {
  if (lastDayNumber === null) return 1;
  return lastDayNumber >= 3 ? 1 : lastDayNumber + 1;
}

export function getPumpScore(session: WorkoutSession): number {
  if (session.exercises.length === 0) return 0;

  let completedSets = 0;
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      totalSets++;
      if (set.completed) {
        completedSets++;
        totalReps += set.reps;
        totalVolume += set.reps * set.weight;
      }
    }
  }

  if (totalSets === 0) return 0;

  const completionRatio = completedSets / totalSets;
  const avgRepsPerSet = completedSets > 0 ? totalReps / completedSets : 0;
  const volumeBonus = Math.min(totalVolume / 5000, 1) * 20;

  const score = Math.round(completionRatio * 70 + Math.min(avgRepsPerSet / 15, 1) * 10 + volumeBonus);
  return Math.max(0, Math.min(100, score));
}

export function getSuggestions(
  sessions: WorkoutSession[],
  exercises: Exercise[]
): AICoachSuggestion[] {
  const suggestions: AICoachSuggestion[] = [];

  if (sessions.length === 0) {
    suggestions.push({
      type: 'motivation',
      message: "Your iron journey begins today. Every champion was once a beginner who refused to give up. Get in there and lift!",
      arnoldQuote: getRandomArnoldQuote(),
    });
    return suggestions;
  }

  // Check for missed days (3+ days since last workout)
  const lastSession = sessions[0];
  const lastDate = new Date(lastSession.date);
  const today = new Date();
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastWorkout >= 3) {
    suggestions.push({
      type: 'motivation',
      message: `It's been ${daysSinceLastWorkout} days since your last workout. Champions don't take breaks — they take victories! Get back in the gym NOW.`,
      arnoldQuote: getRandomArnoldQuote(),
    });
  }

  // Check for deload need (6+ consecutive days)
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let consecutiveDays = 0;
  let checkDate = new Date();
  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);
    const diff = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) {
      consecutiveDays++;
      checkDate = sessionDate;
    } else {
      break;
    }
  }

  if (consecutiveDays >= 6) {
    suggestions.push({
      type: 'deload',
      message: `You've trained ${consecutiveDays} days in a row — your muscles are screaming for growth! Schedule a deload week: 50% weight, focus on form and recovery.`,
      arnoldQuote: getRandomArnoldQuote(),
    });
  }

  // Check for weight increase opportunities per exercise
  const exerciseSessionMap: Record<string, WorkoutSession[]> = {};

  for (const session of sessions.slice(0, 10)) {
    for (const exLog of session.exercises) {
      if (!exerciseSessionMap[exLog.exerciseId]) {
        exerciseSessionMap[exLog.exerciseId] = [];
      }
      exerciseSessionMap[exLog.exerciseId].push(session);
    }
  }

  for (const exercise of exercises.slice(0, 5)) {
    const exSessions = exerciseSessionMap[exercise.id];
    if (!exSessions || exSessions.length < 3) continue;

    const lastThree = exSessions.slice(0, 3);
    let allTopReps = true;

    for (const session of lastThree) {
      const exLog = session.exercises.find(e => e.exerciseId === exercise.id);
      if (!exLog) { allTopReps = false; break; }

      const completedSets = exLog.sets.filter(s => s.completed);
      if (completedSets.length === 0) { allTopReps = false; break; }

      const avgReps = completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length;
      if (avgReps < exercise.repsMax) { allTopReps = false; break; }
    }

    if (allTopReps && suggestions.filter(s => s.type === 'weight_increase').length < 2) {
      const lastExLog = lastThree[0].exercises.find(e => e.exerciseId === exercise.id);
      const lastWeight = lastExLog?.sets[0]?.weight ?? 0;
      const suggestedWeight = lastWeight > 0 ? lastWeight + (exercise.muscleGroup === 'legs' ? 5 : 2.5) : 0;

      suggestions.push({
        type: 'weight_increase',
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        message: `You've been hitting top reps on ${exercise.name} for 3 sessions straight. ${suggestedWeight > 0 ? `Time to go up to ${suggestedWeight}kg!` : 'Add weight — your body is ready for more!'}`,
        arnoldQuote: getRandomArnoldQuote(),
      });
    }
  }

  // Always add a motivation suggestion if list is short
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'motivation',
      message: "You're showing up, and that's what separates champions from dreamers. Keep the intensity high — every rep counts!",
      arnoldQuote: getRandomArnoldQuote(),
    });
  }

  return suggestions;
}

export function calculateTotalVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, exercise) => {
    return total + exercise.sets
      .filter(s => s.completed)
      .reduce((setTotal, set) => setTotal + set.reps * set.weight, 0);
  }, 0);
}

export function getBadges(totalWorkouts: number, streak: number, levelPoints: number): Array<{ id: string; name: string; description: string; icon: string; earned: boolean }> {
  return [
    {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Complete your first workout',
      icon: '💪',
      earned: totalWorkouts >= 1,
    },
    {
      id: 'iron_will',
      name: 'Iron Will',
      description: 'Complete 10 workouts',
      icon: '🏋️',
      earned: totalWorkouts >= 10,
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Complete 50 workouts',
      icon: '⚡',
      earned: totalWorkouts >= 50,
    },
    {
      id: 'centurion',
      name: 'Centurion',
      description: 'Complete 100 workouts',
      icon: '🏆',
      earned: totalWorkouts >= 100,
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      earned: streak >= 7,
    },
    {
      id: 'streak_30',
      name: 'Terminator',
      description: 'Maintain a 30-day streak',
      icon: '🤖',
      earned: streak >= 30,
    },
    {
      id: 'level_100',
      name: 'Rising Champion',
      description: 'Earn 100 XP points',
      icon: '⭐',
      earned: levelPoints >= 100,
    },
    {
      id: 'level_1000',
      name: 'Golden Era',
      description: 'Earn 1000 XP points',
      icon: '👑',
      earned: levelPoints >= 1000,
    },
  ];
}
