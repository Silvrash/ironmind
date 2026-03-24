'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, TrendingUp, Brain, Zap, ChevronRight, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Dumbbell,
    title: 'Arnold-Era Workout Plans',
    description: 'Three tiers: Foundation, Classic Split, and Advanced 2-a-day. Programs built on the same principles that built the Austrian Oak.',
  },
  {
    icon: TrendingUp,
    title: 'Progressive Overload Tracking',
    description: 'Log every set, every rep, every kg. Watch your strength climb week over week with personal record tracking.',
  },
  {
    icon: Brain,
    title: 'AI Coach Suggestions',
    description: 'Rule-based coaching that tells you when to increase weight, take a deload, or push harder. No fluff — just results.',
  },
  {
    icon: Zap,
    title: 'Pump Score & Streaks',
    description: 'Measure workout intensity with your Pump Score. Build streaks. Earn badges. Champions are made by habits.',
  },
];

const STATS = [
  { value: '3', label: 'Training Programs' },
  { value: '25+', label: 'Exercises' },
  { value: '100%', label: 'Free to Start' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">IronMind</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Start Training
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-24 md:py-36 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/50 rounded-full px-4 py-1.5 mb-8 text-sm text-indigo-300">
          <Trophy className="w-3.5 h-3.5" />
          Train Like a Champion
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
          Train Like{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Arnold
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The bodybuilding tracker built on Golden Era principles. Progressive overload, classic splits,
          and Arnold-style intensity — all in your pocket.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white w-full sm:w-auto px-8 py-3 text-base">
              Start Training Free
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 w-full sm:w-auto px-8 py-3 text-base">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-sm mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-indigo-400">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Everything a Champion Needs
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            No fluff, no gimmicks. Pure training tools built for serious lifters who want results.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#111111] border border-zinc-800 rounded-xl p-6 hover:border-indigo-800/50 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-950/60 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Arnold Quote CTA */}
      <section className="px-4 py-20 max-w-4xl mx-auto text-center">
        <blockquote className="text-2xl md:text-3xl font-medium text-zinc-300 italic leading-relaxed mb-8">
          "The last three or four reps is what makes the muscle grow. This area of pain
          divides a champion from someone who is not a champion."
        </blockquote>
        <p className="text-zinc-600 mb-10">— Arnold Schwarzenegger</p>
        <Link href="/signup">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-3 text-base">
            Start Your Iron Journey
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-8 text-center text-zinc-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dumbbell className="w-4 h-4 text-zinc-700" />
          <span className="font-semibold text-zinc-500">IronMind</span>
        </div>
        <p>Built for champions. Train hard, recover harder.</p>
      </footer>
    </div>
  );
}
