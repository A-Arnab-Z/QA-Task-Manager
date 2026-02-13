-- QA/QC Task Management - PostgreSQL Schema
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enumerations
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'team_member', 'qa_lead', 'inspector', 'department_head');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_status AS ENUM ('draft', 'open', 'in_progress', 'on_hold', 'review_pending', 'completed', 'cancelled');
CREATE TYPE notification_channel AS ENUM ('email', 'in_app');

-- Core Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'team_member',
  department VARCHAR(120) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System settings (admin configurable)
CREATE TABLE settings_work_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  sla_hours INT NOT NULL CHECK (sla_hours > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status task_status UNIQUE NOT NULL,
  sort_order INT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task domain
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_code VARCHAR(32) UNIQUE NOT NULL,
  project_name VARCHAR(160) NOT NULL,
  department VARCHAR(120) NOT NULL,
  work_type_id UUID NOT NULL REFERENCES settings_work_types(id),
  description TEXT NOT NULL,
  vendor_or_client VARCHAR(160),
  contract_reference VARCHAR(120),
  priority task_priority NOT NULL DEFAULT 'medium',
  deadline TIMESTAMPTZ NOT NULL,
  assigned_to UUID NOT NULL REFERENCES users(id),
  status task_status NOT NULL DEFAULT 'open',
  progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  estimated_hours NUMERIC(8,2),
  actual_hours NUMERIC(8,2),
  completion_date TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ NOT NULL,
  is_overdue BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_modified_by UUID REFERENCES users(id)
);

CREATE TABLE task_remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  remark_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type VARCHAR(40) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  action_type VARCHAR(80) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification center
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_email BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_email BOOLEAN NOT NULL DEFAULT TRUE,
  overdue_email BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_interval_hours INT NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Performance indexes
CREATE INDEX idx_tasks_assigned_status_deadline ON tasks (assigned_to, status, deadline);
CREATE INDEX idx_tasks_project_status ON tasks (project_name, status);
CREATE INDEX idx_tasks_department_deadline ON tasks (department, deadline);
CREATE INDEX idx_tasks_work_type ON tasks (work_type_id);
CREATE INDEX idx_tasks_search ON tasks USING GIN (to_tsvector('english', coalesce(task_code,'') || ' ' || coalesce(project_name,'') || ' ' || coalesce(description,'')));
CREATE INDEX idx_activity_task_time ON task_activity_log (task_id, changed_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_work_types_updated_at BEFORE UPDATE ON settings_work_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
