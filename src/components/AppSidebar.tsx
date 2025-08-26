import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BarChart3,
  Settings,
  Palette,
  Globe,
  Shield,
  Archive,
  LayoutDashboard,
  LogOut,
  User
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const navigationItems = [
  { title: 'Overview', icon: LayoutDashboard, id: 'overview' },
  { title: 'Analytics', icon: BarChart3, id: 'analytics' },
  { title: 'Design Studio', icon: Palette, id: 'design' },
  { title: 'Domain & SSL', icon: Globe, id: 'domain' },
  { title: 'Backups', icon: Archive, id: 'backups' },
  { title: 'Security', icon: Shield, id: 'security' },
  { title: 'Settings', icon: Settings, id: 'settings' },
];

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  user: any;
  onSignOut: () => void;
}

export function AppSidebar({ activeView, onViewChange, user, onSignOut }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border" style={{ '--sidebar-width': '240px', '--sidebar-width-icon': '60px' } as React.CSSProperties}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <img 
              src="/brand-logo.svg" 
              alt="Naveeg" 
              className="h-6 w-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground hidden">
              N
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Naveeg</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={collapsed ? handleSignOut : undefined}
              tooltip={collapsed ? "Sign Out" : undefined}
              className="relative"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate">
                    My Account
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}