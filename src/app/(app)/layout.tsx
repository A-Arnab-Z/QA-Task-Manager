import { AuthGuard } from '@/components/layout/auth-guard';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
