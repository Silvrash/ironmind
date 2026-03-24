'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Dumbbell, Target, Zap, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import type { UserLevel, UserGoal, PlanVariant, UserProfile } from '@/lib/types';
import { PLAN_DESCRIPTIONS } from '@/lib/workout-data';

const LEVELS: { value: UserLevel; label: string; description: string; icon: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Less than 1 year of consistent training. Learning the basics.',
    icon: '🌱',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: '1-3 years of training. Solid foundation, ready to specialize.',
    icon: '💪',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: '3+ years of serious training. Ready for the full Arnold protocol.',
    icon: '🏆',
  },
];

const GOALS: { value: UserGoal; label: string; description: string; icon: string }[] = [
  {
    value: 'mass',
    label: 'Maximum Mass',
    description: 'Pack on as much muscle as possible. Size is the priority.',
    icon: '🔥',
  },
  {
    value: 'aesthetics',
    label: 'Aesthetics',
    description: 'Build a balanced, proportionate physique. The Golden Era look.',
    icon: '⭐',
  },
  {
    value: 'strength',
    label: 'Raw Strength',
    description: 'Build foundational power. Move more weight every session.',
    icon: '⚡',
  },
];

function getPlanForLevel(level: UserLevel): PlanVariant {
  if (level === 'beginner') return 'beginner';
  if (level === 'intermediate') return 'classic';
  return 'advanced';
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<UserLevel | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const planVariant = selectedLevel ? getPlanForLevel(selectedLevel) : null;

  const handleComplete = async () => {
    if (!user || !selectedLevel || !selectedGoal || !planVariant) return;

    setSaving(true);
    try {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Champion',
        level: selectedLevel,
        goal: selectedGoal,
        planVariant,
        subscriptionTier: 'free',
        streak: 0,
        lastWorkoutDate: null,
        totalWorkouts: 0,
        level_points: 0,
        createdAt: new Date().toISOString(),
      };

      await createUserProfile(profile);
      await refreshProfile();
      toast.success("Program assigned! It's time to build your legacy.");
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo & Progress */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <Dumbbell className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold">IronMind</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    s < step
                      ? 'bg-indigo-600 text-white'
                      : s === step
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 ${s < step ? 'bg-indigo-600' : 'bg-zinc-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Experience Level */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-indigo-950/60 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">What's your experience level?</h2>
              <p className="text-zinc-500 text-sm mt-2">Be honest — the right program makes all the difference.</p>
            </div>
            <div className="space-y-3">
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedLevel === level.value
                      ? 'border-indigo-600 bg-indigo-950/30'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-100">{level.label}</span>
                        {selectedLevel === level.value && (
                          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm mt-0.5">{level.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedLevel}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-indigo-950/60 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">What's your primary goal?</h2>
              <p className="text-zinc-500 text-sm mt-2">Your goal shapes your rep ranges and programming focus.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setSelectedGoal(goal.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedGoal === goal.value
                      ? 'border-indigo-600 bg-indigo-950/30'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-100">{goal.label}</span>
                        {selectedGoal === goal.value && (
                          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm mt-0.5">{goal.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedGoal}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Plan Assignment */}
        {step === 3 && planVariant && (
          <div>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-green-950/60 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Your program is ready</h2>
              <p className="text-zinc-500 text-sm mt-2">We've selected the perfect program for your level and goals.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/30 border border-indigo-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Assigned Program</div>
                  <div className="font-black text-lg capitalize">
                    {planVariant === 'beginner' ? "Arnold's Foundation"
                      : planVariant === 'classic' ? "The Classic Arnold Split"
                      : "The Advanced 2-A-Day"}
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-5">{PLAN_DESCRIPTIONS[planVariant]}</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-indigo-400">3</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Days/Cycle</div>
                </div>
                <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-indigo-400">
                    {planVariant === 'beginner' ? '5-6' : planVariant === 'classic' ? '6-9' : '10-11'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">Exercises/Day</div>
                </div>
                <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-indigo-400">
                    {planVariant === 'beginner' ? '~60' : planVariant === 'classic' ? '~90' : '~120'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">Min/Session</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-medium">Summary</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Level</span>
                  <span className="capitalize font-medium">{selectedLevel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Goal</span>
                  <span className="capitalize font-medium">{selectedGoal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Program</span>
                  <span className="capitalize font-medium">{planVariant}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={saving}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    Start Training
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
