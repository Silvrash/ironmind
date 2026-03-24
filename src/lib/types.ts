export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type UserGoal = 'mass' | 'aesthetics' | 'strength';
export type PlanVariant = 'beginner' | 'classic' | 'advanced';
export type SubscriptionTier = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  level: UserLevel;
  goal: UserGoal;
  planVariant: PlanVariant;
  subscriptionTier: SubscriptionTier;
  streak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  level_points: number;
  createdAt: string;
}

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  setsMin: number;
  setsMax: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  formTip: string;
}

export interface WorkoutDay {
  dayNumber: number;
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  personalRecord: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  dayNumber: number;
  dayName: string;
  exercises: ExerciseLog[];
  completed: boolean;
  durationMinutes: number;
  totalVolume: number;
  pumpScore: number;
  createdAt: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface AICoachSuggestion {
  type: 'weight_increase' | 'deload' | 'exercise_swap' | 'motivation';
  exerciseId?: string;
  exerciseName?: string;
  message: string;
  arnoldQuote: string;
}
