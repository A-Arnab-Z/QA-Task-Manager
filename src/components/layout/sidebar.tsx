'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/firebase/init';

export function Sidebar() {
  const pathname = usePathname();
  const overdueQuery = useMemo(() => query(collection(db, 'tasks'), where('status', '!=', 'completed')), []);
  const [snapshot] = useCollection(overdueQuery);
  const overdueCount = snapshot?.docs.filter((d) => new Date(d.data().deadline).getTime() < Date.now()).length ?? 0;

  return (
    <aside className="w-64 border-r min-h-[calc(100vh-57px)] p-3 space-y-2">
      <Link className={`block rounded px-3 py-2 ${pathname === '/dashboard' ? 'bg-slate-200 dark:bg-slate-800' : ''}`} href="/dashboard">Dashboard</Link>
      <Link className={`flex justify-between rounded px-3 py-2 ${pathname === '/tasks' ? 'bg-slate-200 dark:bg-slate-800' : ''}`} href="/tasks">
        <span>Tasks</span><span className="text-xs bg-red-500 text-white rounded px-2">{overdueCount}</span>
      </Link>
    </aside>
  );
}
