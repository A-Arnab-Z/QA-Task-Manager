'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/firebase/init';

export function MemberDashboard() {
  const { user, profile } = useAuth();
  const myTasksQuery = useMemo(() => query(collection(db, 'tasks'), where('assignedTo', '==', user?.uid || '__none__')), [user?.uid]);
  const [snap, loading] = useCollection(myTasksQuery);
  if (loading) return <div className="animate-pulse">Loading your tasks...</div>;
  const tasks = snap?.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{ id: string; projectName: string; deadline: string; status: string }> ?? [];
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const today = new Date().toDateString();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Welcome, {profile?.name}!</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="border rounded p-4">My Pending Tasks: {pendingTasks.length}</div>
        <div className="border rounded p-4">My Overdue Tasks: {pendingTasks.filter((t) => new Date(t.deadline).getTime() < Date.now()).length}</div>
        <div className="border rounded p-4">Tasks Due Today: {tasks.filter((t) => new Date(t.deadline).toDateString() === today).length}</div>
        <div className="border rounded p-4">My Completed Tasks: {tasks.filter((t) => t.status === 'completed').length}</div>
      </div>
      <div className="border rounded p-4">
        <h3 className="mb-2 font-medium">My Pending Tasks</h3>
        <table className="w-full text-sm"><thead><tr><th className="text-left">Project</th><th className="text-left">Deadline</th><th className="text-left">Status</th></tr></thead><tbody>{pendingTasks.map((t) => <tr key={t.id}><td>{t.projectName}</td><td>{new Date(t.deadline).toLocaleDateString()}</td><td>{t.status}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
