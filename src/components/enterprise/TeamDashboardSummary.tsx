import React from 'react';

type TeamSummaryProps = {
  active: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
};

export function TeamDashboardSummary({ active, overdue, dueToday, completionRate }: TeamSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-card p-4">My Active Tasks: {active}</div>
      <div className="rounded-xl border bg-card p-4 text-red-600">My Overdue Tasks: {overdue}</div>
      <div className="rounded-xl border bg-card p-4">My Tasks Due Today: {dueToday}</div>
      <div className="rounded-xl border bg-card p-4 text-emerald-600">My Completion Rate: {completionRate}%</div>
    </div>
  );
}
