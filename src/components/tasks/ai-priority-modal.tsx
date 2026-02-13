'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { prioritizeTasks } from '@/ai/prioritize-tasks';
import { updateTask } from '@/app/actions/tasks';

type Suggestion = { taskId: string; revisedPriority: Task['priority']; reason: string };

export function AiPriorityModal({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  const [workloadCapacity, setWorkloadCapacity] = useState('');
  const [recentAchievements, setRecentAchievements] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function generate() {
    const output = await prioritizeTasks({ workloadCapacity, recentAchievements, tasks: tasks.map((t) => ({ id: t.id, projectName: t.projectName, priority: t.priority, deadline: t.deadline, status: t.status })) });
    setSuggestions(output);
  }

  async function apply() {
    await Promise.all(suggestions.map((s) => updateTask(s.taskId, { priority: s.revisedPriority })));
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-6">
      <div className="bg-card border rounded p-4 w-full max-w-3xl space-y-3">
        <h3 className="text-lg font-semibold">AI Priority</h3>
        <textarea className="w-full border rounded p-2" placeholder="Current Workload Capacity" value={workloadCapacity} onChange={(e) => setWorkloadCapacity(e.target.value)} />
        <textarea className="w-full border rounded p-2" placeholder="Recent Engineering Achievements" value={recentAchievements} onChange={(e) => setRecentAchievements(e.target.value)} />
        <button className="border rounded px-3 py-1" onClick={generate}>Generate Suggestions</button>
        <table className="w-full text-sm"><thead><tr><th>Task</th><th>Revised Priority</th><th>Reason</th></tr></thead><tbody>{suggestions.map((s) => <tr key={s.taskId}><td>{tasks.find((t) => t.id === s.taskId)?.projectName}</td><td>{s.revisedPriority}</td><td>{s.reason}</td></tr>)}</tbody></table>
        <div className="flex justify-end gap-2"><button className="border rounded px-3 py-1" onClick={onClose}>Cancel</button><button className="rounded bg-black text-white dark:bg-white dark:text-black px-3 py-1" onClick={apply}>Apply Changes</button></div>
      </div>
    </div>
  );
}
