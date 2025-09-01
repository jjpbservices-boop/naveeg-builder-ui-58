import { DashboardLayout } from '@naveeg/ui';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      siteName="My Website"
      plan="starter"
      status="draft"
    >
      {children}
    </DashboardLayout>
  );
}
