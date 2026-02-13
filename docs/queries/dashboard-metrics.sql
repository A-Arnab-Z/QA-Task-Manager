-- Admin dashboard KPI queries

-- Total, active, completed, overdue, due today, due this week
SELECT
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE status IN ('open', 'in_progress', 'review_pending', 'on_hold')) AS active_tasks,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
  COUNT(*) FILTER (WHERE deadline < NOW() AND status <> 'completed') AS overdue_tasks,
  COUNT(*) FILTER (WHERE deadline::date = CURRENT_DATE AND status <> 'completed') AS due_today,
  COUNT(*) FILTER (
    WHERE deadline::date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '6 day')
      AND status <> 'completed'
  ) AS due_this_week
FROM tasks;

-- Work type distribution (pie chart)
SELECT wt.name AS work_type, COUNT(*) AS total
FROM tasks t
JOIN settings_work_types wt ON wt.id = t.work_type_id
GROUP BY wt.name
ORDER BY total DESC;

-- Monthly completion trend (line chart)
SELECT DATE_TRUNC('month', completion_date) AS month, COUNT(*) AS completed_count
FROM tasks
WHERE completion_date IS NOT NULL
GROUP BY DATE_TRUNC('month', completion_date)
ORDER BY month;

-- Team workload comparison
SELECT u.name, COUNT(*) AS active_tasks, COALESCE(SUM(t.estimated_hours),0) AS estimated_hours
FROM users u
LEFT JOIN tasks t ON t.assigned_to = u.id AND t.status <> 'completed'
GROUP BY u.id, u.name
ORDER BY active_tasks DESC;

-- SLA compliance percentage
SELECT
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE completion_date <= sla_due_at)
    / NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0),
    2
  ) AS sla_compliance_percent
FROM tasks;

-- Average completion time in hours
SELECT ROUND(AVG(EXTRACT(EPOCH FROM (completion_date - created_at))/3600), 2) AS avg_completion_hours
FROM tasks
WHERE completion_date IS NOT NULL;
