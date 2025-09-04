import AppShell from '../../components/layout/AppShell';
import { Sidebar } from '../../components/nav/Sidebar';
import { Header } from '../../components/layout/Header';
import { Icon } from '@naveeg/ui';

const navItems = [
  {
    href: '/app/overview',
    label: 'Overview',
    icon: <Icon name="home" className="w-5 h-5" />,
    active: true,
  },
  {
    href: '/app/analytics',
    label: 'Analytics',
    icon: <Icon name="bar-chart-3" className="w-5 h-5" />,
    active: false,
  },
  {
    href: '/app/pages',
    label: 'Pages & Content',
    icon: <Icon name="file-text" className="w-5 h-5" />,
    active: false,
  },
  {
    href: '/app/domains',
    label: 'Domains & Security',
    icon: <Icon name="shield" className="w-5 h-5" />,
    active: false,
  },
  {
    href: '/app/billing',
    label: 'Billing',
    icon: <Icon name="credit-card" className="w-5 h-5" />,
    active: false,
  },
  {
    href: '/app/settings',
    label: 'Settings',
    icon: <Icon name="settings" className="w-5 h-5" />,
    active: false,
  },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      sidebar={<Sidebar items={navItems} collapsed={false} />}
      header={<Header siteName="My Website" plan="starter" status="draft" />}
    >
      {children}
    </AppShell>
  );
}
