import React from 'react';

type Kpi = { label: string; value: string | number; tone?: 'default' | 'danger' | 'success' };

export function AdminKpiGrid({ items }: { items: Kpi[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              item.tone === 'danger'
                ? 'text-red-600'
                : item.tone === 'success'
                  ? 'text-emerald-600'
                  : 'text-foreground'
            }`}
          >
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}
