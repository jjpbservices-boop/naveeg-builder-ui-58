import { DashboardLayout } from '@naveeg/ui';
import { DashboardSidebar } from '../../components/ui/DashboardSidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content area */}
      <DashboardLayout
        siteName="My Website"
        plan="starter"
        status="draft"
      >
        {children}
      </DashboardLayout>
    </div>
  );
}
