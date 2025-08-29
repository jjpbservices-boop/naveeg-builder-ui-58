import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
  BarChart3,
  Settings,
  Palette,
  Globe,
  Shield,
  Archive,
  LayoutDashboard,
  LogOut,
  User,
  Sun,
  Moon,
  Languages,
  Store,
  Mail,
  Zap,
  Lock,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

const navigationItems = [
  { title: 'Overview', icon: LayoutDashboard, id: 'overview', requiredFeature: null },
  { title: 'Analytics', icon: BarChart3, id: 'analytics', requiredFeature: 'analytics_advanced' },
  { title: 'Design Studio', icon: Palette, id: 'design', requiredFeature: null },
  { title: 'Domain & SSL', icon: Globe, id: 'domain', requiredFeature: null },
  { title: 'Store', icon: Store, id: 'store', requiredFeature: 'store' },
  { title: 'Forms & Leads', icon: Mail, id: 'forms', requiredFeature: 'forms_advanced' },
  { title: 'Automations', icon: Zap, id: 'automations', requiredFeature: 'automations' },
  { title: 'Backups', icon: Archive, id: 'backups', requiredFeature: null },
  { title: 'Security', icon: Shield, id: 'security', requiredFeature: null },
  { title: 'My Plan', icon: CreditCard, id: 'plans', requiredFeature: null },
  { title: 'Settings', icon: Settings, id: 'settings', requiredFeature: null },
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
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation('common');
  const { subscription, isSubscriptionActive, canConnectDomain } = useSubscription();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  };

  const isFeatureAccessible = (item: any) => {
    if (!item.requiredFeature) return true;
    
    const planId = subscription?.plan_id;
    if (!isSubscriptionActive()) return false;
    
    // Feature access by plan level
    switch (item.requiredFeature) {
      case 'store':
      case 'forms_advanced':
      case 'automations':
        return planId === 'pro' || planId === 'custom';
      case 'analytics_advanced':
        return planId === 'starter' || planId === 'pro' || planId === 'custom';
      default:
        return true;
    }
  };

  const getPlanBadge = React.useMemo(() => {
    if (!subscription) return 'Trial';
    return subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1);
  }, [subscription?.plan_id]);

  return (
    <Sidebar collapsible="icon" className="border-r border-border" style={{ '--sidebar-width': '240px', '--sidebar-width-icon': '64px' } as React.CSSProperties}>
      <SidebarHeader className={cn("h-16 flex items-center", collapsed ? "justify-center p-2" : "gap-3 p-4")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-10 w-10 items-center justify-center shrink-0">
            <img 
              src="/brand-logo.svg" 
              alt="Naveeg" 
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
            <div className="flex h-8 w-8 items-center justify-center rounded bg-transparent hidden">
              <img 
                src="/lovable-uploads/b874b017-8b73-4029-9431-6caffeaef48c.png" 
                alt="Naveeg" 
                className="h-8 w-8 object-contain"
              />
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

      <SidebarContent className={cn(collapsed ? "px-2" : "px-4")}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isAccessible = isFeatureAccessible(item);
                const isLocked = item.requiredFeature && !isAccessible;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      isActive={activeView === item.id}
                      tooltip={collapsed ? item.title : undefined}
                      className={cn(
                        "h-10 w-full flex items-center relative",
                        collapsed ? "justify-center px-2" : "justify-start px-3",
                        isLocked && "text-muted-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", isLocked && "opacity-50")} />
                      {!collapsed && (
                        <span className={cn("ml-2", isLocked && "opacity-50")}>
                          {item.title}
                        </span>
                      )}
                      {isLocked && !collapsed && (
                        <Lock className="h-3 w-3 ml-auto text-muted-foreground opacity-50" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn("space-y-1", collapsed ? "p-2" : "p-4")}>
        {/* Theme Toggle */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
              className={cn(
                "h-10 w-full flex items-center",
                collapsed ? "justify-center px-2" : "justify-start px-3"
              )}
            >
              <Sun className="h-4 w-4 shrink-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 shrink-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              {!collapsed && <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Language Selector */}
        <SidebarMenu>
          <SidebarMenuItem>
            {collapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton 
                    tooltip="Language"
                    className="h-10 w-full flex items-center justify-center px-2"
                  >
                    <Languages className="h-4 w-4 shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={i18n.language === lang.code ? 'bg-accent' : ''}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-10 w-full flex items-center justify-start px-3">
                    <div className="flex items-center">
                      <Languages className="h-4 w-4 shrink-0" />
                      <span className="ml-2">
                        {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={i18n.language === lang.code ? 'bg-accent' : ''}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Plan Badge */}
        {!collapsed && (
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">Plan</span>
              <span className="text-xs font-bold text-primary">
                {getPlanBadge}
              </span>
            </div>
          </div>
        )}

        {/* User Account */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={collapsed ? handleSignOut : undefined}
              tooltip={collapsed ? "Sign Out" : undefined}
              className={cn(
                "h-10 w-full relative flex items-center",
                collapsed ? "justify-center px-2" : "justify-start px-3"
              )}
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between min-w-0 ml-2">
                  <span className="text-xs font-medium text-foreground truncate">
                    Account
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
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