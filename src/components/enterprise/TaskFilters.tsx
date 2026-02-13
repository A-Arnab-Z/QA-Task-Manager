'use client';

import React from 'react';

type TaskFiltersProps = {
  onApply: (filters: {
    project?: string;
    status?: string;
    from?: string;
    to?: string;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => void;
};

export function TaskFilters({ onApply }: TaskFiltersProps) {
  return (
    <form
      className="grid gap-3 md:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        onApply({
          project: String(form.get('project') || ''),
          status: String(form.get('status') || ''),
          from: String(form.get('from') || ''),
          to: String(form.get('to') || ''),
          keyword: String(form.get('keyword') || ''),
          sortBy: String(form.get('sortBy') || 'deadline'),
          sortOrder: (String(form.get('sortOrder') || 'asc') as 'asc' | 'desc'),
        });
      }}
    >
      <input name="project" placeholder="Project" className="rounded-md border p-2" />
      <select name="status" className="rounded-md border p-2">
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <input type="date" name="from" className="rounded-md border p-2" />
      <input type="date" name="to" className="rounded-md border p-2" />
      <input name="keyword" placeholder="Keyword" className="rounded-md border p-2" />
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Apply</button>
    </form>
  );
}
