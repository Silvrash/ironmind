'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, Zap, Brain, BarChart2, Dumbbell, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/Navigation';
import { Button } from '@/components/ui/button';

const FREE_FEATURES = [
  '3 Workout Programs (Beginner, Classic, Advanced)',
  'Full Exercise Library (25+ exercises)',
  'Set & Rep Logging',
  'Personal Records Tracking',
  'Workout Streak Counter',
  'Basic Progress Stats',
  'Badge System',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Full AI Coach Suggestions',
  'Advanced Analytics & Volume Charts',
  'Custom Split Builder',
  'Export Workout Data (CSV)',
  'Priority Support',
  'Early Access to New Features',
  'Remove All Ads',
];

export default function PremiumPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isPremium = userProfile?.subscriptionTier === 'premium';

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId: user.uid, email: user.email }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Premium</h1>
        <p className="text-zinc-500 text-sm mt-1">Unlock the full Arnold experience.</p>
      </div>

      {/* Test Mode Notice */}
      <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-3 mb-6 flex items-start gap-2">
        <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-400">
          <span className="font-semibold">Test Mode:</span> Stripe is in test mode. Use card{' '}
          <span className="font-mono">4242 4242 4242 4242</span> with any future expiry and CVC.
        </p>
      </div>

      {isPremium ? (
        <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/30 border border-indigo-800/50 rounded-xl p-6 mb-6 text-center">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-black mb-2">You're a Premium Member!</h2>
          <p className="text-zinc-500 text-sm">All features unlocked. Train like the champion you are.</p>
        </div>
      ) : (
        <>
          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/30 border border-indigo-700/50 rounded-xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">IronMind Premium</span>
            </div>
            <div className="mb-4">
              <span className="text-5xl font-black text-zinc-100">$9.99</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              Train smarter with full AI coaching, advanced analytics, and custom programming.
              Cancel anytime.
            </p>
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading checkout...
                </span>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Feature Comparison */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Free Tier */}
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-zinc-500" />
            <h3 className="font-bold text-zinc-300">Free</h3>
            <span className="ml-auto text-sm font-black text-zinc-500">$0</span>
          </div>
          <div className="space-y-2.5">
            {FREE_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Tier */}
        <div className="bg-[#111111] border border-indigo-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-zinc-100">Premium</h3>
            <span className="ml-auto text-sm font-black text-indigo-400">$9.99/mo</span>
          </div>
          <div className="space-y-2.5">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
          {!isPremium && (
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full mt-5 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Get Premium
            </Button>
          )}
        </div>
      </div>

      {/* Money-back Guarantee */}
      <div className="text-center text-xs text-zinc-600 pb-4">
        <Star className="w-4 h-4 inline mr-1 text-yellow-700" />
        30-day money-back guarantee · Cancel anytime · No hidden fees
      </div>
    </AppShell>
  );
}
