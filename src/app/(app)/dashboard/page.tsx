'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { MemberDashboard } from '@/components/dashboard/member-dashboard';

export default function DashboardPage() {
  const { profile } = useAuth();
  if (!profile) return <div className="animate-pulse">Loading profile...</div>;
  return profile.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
}
