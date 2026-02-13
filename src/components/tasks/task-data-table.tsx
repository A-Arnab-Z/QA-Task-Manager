'use client';

import { useMemo, useState } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/firebase/init';
import { Task } from '@/lib/types';
import { isOverdue } from '@/lib/utils';
import { deleteTask } from '@/app/actions/tasks';
import { TaskForm } from './task-form';
import { useAuth } from '@/components/auth/auth-provider';
import { AiPriorityModal } from './ai-priority-modal';

const priorityColor: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500', low: 'bg-slate-500' };
const statusColor: Record<string, string> = { pending: 'bg-yellow-500', inProgress: 'bg-blue-500', blocked: 'bg-red-500', completed: 'bg-green-500' };

export function TaskDataTable() {
  const { profile, user } = useAuth();
  const tasksQuery = useMemo(() => query(collection(db, 'tasks'), orderBy('deadline', 'asc')), []);
  const [snap, loading] = useCollection(tasksQuery);
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  if (loading) return <div className="animate-pulse">Loading tasks...</div>;
  const tasks = (snap?.docs.map((d) => ({ id: d.id, ...d.data() } as Task)) ?? []).filter((t) =>
    t.projectName.toLowerCase().includes(projectFilter.toLowerCase()) &&
    (statusFilter === 'all' || t.status === statusFilter) &&
    (workTypeFilter === 'all' || t.workType === workTypeFilter)
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input className="border rounded p-2" placeholder="Filter project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} />
        <select className="border rounded p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All status</option><option value="pending">Pending</option><option value="inProgress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select>
        <select className="border rounded p-2" value={workTypeFilter} onChange={(e) => setWorkTypeFilter(e.target.value)}><option value="all">All work types</option><option value="inspection">Inspection</option><option value="testing">Testing</option><option value="documentation">Documentation</option><option value="compliance">Compliance</option></select>
        {profile?.role === 'admin' && <button className="ml-auto border rounded px-3 py-2" onClick={() => setAiOpen(true)}>AI Priority</button>}
        {profile?.role === 'admin' && <button className="border rounded px-3 py-2" onClick={() => setCreateOpen(true)}>Create Task</button>}
      </div>
      <table className="w-full text-sm border rounded overflow-hidden">
        <thead><tr className="border-b"><th>Project</th><th>Work Type</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Deadline</th><th>Actions</th></tr></thead>
        <tbody>{tasks.map((task) => <tr key={task.id} className="border-b"><td>{task.projectName}</td><td>{task.workType}</td><td>{task.assignedToName}</td><td><span className={`text-white rounded px-2 py-0.5 ${priorityColor[task.priority]}`}>{task.priority}</span></td><td><span className={`text-white rounded px-2 py-0.5 ${statusColor[task.status]}`}>{task.status}</span></td><td className={isOverdue(task.deadline) && task.status !== 'completed' ? 'text-red-500 font-semibold' : ''}>{new Date(task.deadline).toLocaleDateString()}</td><td className="space-x-2"><button className="underline" onClick={() => setEditingTask(task)}>View/Edit</button>{profile?.role === 'admin' && <button className="underline text-red-500" onClick={() => deleteTask(task.id)}>Delete</button>}</td></tr>)}</tbody>
      </table>

      {(editingTask || createOpen) && (
        <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card border-l p-4 overflow-y-auto">
          <div className="flex justify-between mb-3"><h3 className="text-lg font-semibold">{editingTask ? 'Edit Task' : 'Create Task'}</h3><button onClick={() => { setEditingTask(null); setCreateOpen(false); }}>Close</button></div>
          <TaskForm task={editingTask} canEditAll={profile?.role === 'admin'} onClose={() => { setEditingTask(null); setCreateOpen(false); }} />
        </div>
      )}

      {aiOpen && profile?.role === 'admin' && <AiPriorityModal tasks={tasks} onClose={() => setAiOpen(false)} />}
    </div>
  );
}
