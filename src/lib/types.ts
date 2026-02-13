export type UserRole = 'admin' | 'member';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
};

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'inProgress' | 'blocked' | 'completed';

export type Task = {
  id: string;
  projectName: string;
  workType: 'inspection' | 'testing' | 'documentation' | 'compliance';
  description: string;
  priority: TaskPriority;
  deadline: string;
  assignedTo: string;
  assignedToName: string;
  status: TaskStatus;
  remarks?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  taskId: string;
  taskTitle: string;
  actorId: string;
  actorName: string;
  actionType: 'create' | 'update' | 'delete' | 'priorityUpdate';
  changeSummary: string;
  createdAt: string;
};
