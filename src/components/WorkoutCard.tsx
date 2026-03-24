'use client';

import Link from 'next/link';
import { Dumbbell, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkoutDay } from '@/lib/types';
import { MUSCLE_GROUP_COLORS } from '@/lib/workout-data';

interface WorkoutCardProps {
  workoutDay: WorkoutDay;
  estimatedMinutes?: number;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact';
}

export default function WorkoutCard({
  workoutDay,
  estimatedMinutes,
  actionLabel = 'Start Workout',
  actionHref,
  onAction,
  variant = 'default',
}: WorkoutCardProps) {
  const estimate = estimatedMinutes ?? workoutDay.exercises.length * 12;

  if (variant === 'compact') {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-zinc-100">{workoutDay.name}</span>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            {estimate}m
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {workoutDay.muscleGroups.slice(0, 3).map((group) => (
            <span
              key={group}
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${MUSCLE_GROUP_COLORS[group] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            >
              {group}
            </span>
          ))}
          <span className="text-xs text-zinc-600">{workoutDay.exercises.length} exercises</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/30 px-5 py-4 border-b border-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-1">
              Day {workoutDay.dayNumber}
            </div>
            <h3 className="text-lg font-black tracking-tight">{workoutDay.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 bg-zinc-900/50 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>~{estimate} min</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Muscle Groups */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {workoutDay.muscleGroups.map((group) => (
            <span
              key={group}
              className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${MUSCLE_GROUP_COLORS[group] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            >
              {group}
            </span>
          ))}
        </div>

        {/* Exercise Preview */}
        <div className="space-y-2 mb-4">
          {workoutDay.exercises.slice(0, 4).map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-zinc-300">{exercise.name}</span>
              </div>
              <span className="text-zinc-600 text-xs">
                {exercise.setsMin}-{exercise.setsMax} × {exercise.repsMin}-{exercise.repsMax}
              </span>
            </div>
          ))}
          {workoutDay.exercises.length > 4 && (
            <div className="text-xs text-zinc-600 pl-5">
              +{workoutDay.exercises.length - 4} more exercises
            </div>
          )}
        </div>

        {/* Action */}
        {actionHref ? (
          <Link href={actionHref}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              {actionLabel}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        ) : onAction ? (
          <Button
            onClick={onAction}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {actionLabel}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
