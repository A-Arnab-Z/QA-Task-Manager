'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { createTask, updateTask } from '@/app/actions/tasks';

const defaultTask: Partial<Task> = { projectName: '', workType: 'inspection', description: '', priority: 'medium', status: 'pending', assignedTo: '', assignedToName: '', deadline: new Date().toISOString().slice(0,10) };

export function TaskForm({ task, canEditAll, onClose }: { task?: Task | null; canEditAll: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Task>>(task ?? defaultTask);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (task?.id) await updateTask(task.id, form);
    else await createTask({ ...(form as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>), createdBy: 'system' });
    onClose();
  }

  const readOnly = !canEditAll;

  return (
    <form onSubmit={submit} className="space-y-2">
      <input disabled={readOnly} className="w-full border rounded p-2" placeholder="Project Name" value={form.projectName || ''} onChange={(e) => setForm((s) => ({ ...s, projectName: e.target.value }))} />
      <select disabled={readOnly} className="w-full border rounded p-2" value={form.workType} onChange={(e) => setForm((s) => ({ ...s, workType: e.target.value as Task['workType'] }))}><option value="inspection">Inspection</option><option value="testing">Testing</option><option value="documentation">Documentation</option><option value="compliance">Compliance</option></select>
      <textarea disabled={readOnly} className="w-full border rounded p-2" placeholder="Description" value={form.description || ''} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
      <input disabled={readOnly} type="date" className="w-full border rounded p-2" value={(form.deadline || '').slice(0,10)} onChange={(e) => setForm((s) => ({ ...s, deadline: e.target.value }))} />
      <select disabled={!canEditAll && task?.assignedTo !== form.assignedTo} className="w-full border rounded p-2" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as Task['status'] }))}><option value="pending">Pending</option><option value="inProgress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select>
      <textarea className="w-full border rounded p-2" placeholder="Remarks" value={form.remarks || ''} onChange={(e) => setForm((s) => ({ ...s, remarks: e.target.value }))} />
      <button className="rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2">Save Task</button>
    </form>
  );
}
