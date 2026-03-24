'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Dumbbell, BarChart2, Star, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/progress', label: 'Progress', icon: BarChart2 },
  { href: '/premium', label: 'Premium', icon: Star },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      toast.success('Signed out. Rest up, champion.');
    } catch {
      toast.error('Sign out failed.');
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Champion';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-lg tracking-tight">IronMind</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm text-zinc-400 hidden sm:block">{displayName}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-sm border-t border-zinc-800 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-400'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-[57px] bottom-0 w-56 bg-[#0d0d0d] border-r border-zinc-800 flex-col py-4 z-30">
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-auto">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-900 mb-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-300 truncate">{displayName}</div>
              <div className="text-xs text-zinc-600 truncate capitalize">{userProfile?.subscriptionTier || 'free'}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation />
      <main className="md:ml-56 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
