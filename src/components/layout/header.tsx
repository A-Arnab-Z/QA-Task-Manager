'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '@/components/auth/auth-provider';

export function Header() {
  const { setTheme, theme } = useTheme();
  const { profile, logout } = useAuth();
  return (
    <header className="border-b px-4 py-3 flex justify-between items-center">
      <h1 className="font-semibold">QC TaskMaster</h1>
      <div className="flex items-center gap-3">
        <button className="border rounded px-3 py-1" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Theme</button>
        <div className="text-right text-sm">
          <p>{profile?.name}</p>
          <p className="text-xs opacity-70">{profile?.email}</p>
        </div>
        <button className="border rounded px-3 py-1" onClick={() => logout()}>Log out</button>
      </div>
    </header>
  );
}
