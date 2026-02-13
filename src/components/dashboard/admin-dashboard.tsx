'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/firebase/init';

const colors = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

export function AdminDashboard() {
  const tasksQuery = useMemo(() => query(collection(db, 'tasks')), []);
  const activityQuery = useMemo(() => query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(8)), []);
  const [tasksSnap, tasksLoading] = useCollection(tasksQuery);
  const [activitySnap] = useCollection(activityQuery);

  if (tasksLoading) return <div className="animate-pulse">Loading dashboard...</div>;
  const tasks = tasksSnap?.docs.map((d) => d.data()) ?? [];
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status !== 'completed').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const overdue = tasks.filter((t) => t.status !== 'completed' && new Date(t.deadline).getTime() < Date.now()).length;

  const workTypeData = Object.entries(tasks.reduce((acc: Record<string, number>, cur) => {
    acc[cur.workType] = (acc[cur.workType] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const monthData = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString('default', { month: 'short' });
    return { month, completed: tasks.filter((t) => t.status === 'completed' && new Date(t.updatedAt).getMonth() === d.getMonth()).length };
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {[['Total Tasks', total], ['Pending Tasks', pending], ['Completed Tasks', completed], ['Overdue Tasks', overdue]].map(([k, v]) => (
          <div key={k} className="border rounded p-4"><p className="text-sm opacity-75">{k}</p><p className="text-2xl font-semibold">{v}</p></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-4 h-80"><h3 className="font-medium mb-2">Monthly Completion Trend</h3><ResponsiveContainer width="100%" height="90%"><BarChart data={monthData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="completed" fill="#3b82f6" /></BarChart></ResponsiveContainer></div>
        <div className="border rounded p-4 h-80"><h3 className="font-medium mb-2">Work Type Distribution</h3><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={workTypeData} dataKey="value" nameKey="name" outerRadius={100}>{workTypeData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
      <div className="border rounded p-4"><h3 className="font-medium mb-2">Recent Activity</h3><ul className="space-y-2 text-sm">{activitySnap?.docs.map((d) => <li key={d.id}>{d.data().changeSummary}</li>)}</ul></div>
    </div>
  );
}
