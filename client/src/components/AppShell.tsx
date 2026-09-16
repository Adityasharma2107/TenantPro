import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import { useRealtimeTickets } from '../hooks/useRealtimeTickets';
import type { CurrentUser, ManagedProperty } from '../types/ticket';
import { Brand } from './Brand';
import { CreateTicketModal } from './CreateTicketModal';
import { NotificationDropdown } from './NotificationDropdown';
import { ThemeToggle } from './ThemeToggle';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/app/dashboard')) return [{ label: 'Dashboard' }];
    if (path.includes('/app/tickets/') && path !== '/app/tickets') {
      return [
        { label: 'Tickets', to: '/app/tickets' },
        { label: 'Ticket Details' },
      ];
    }
    if (path.includes('/app/tickets')) return [{ label: 'Tickets' }];
    if (path.includes('/app/residents')) return [{ label: 'Residents Directory' }];
    if (path.includes('/app/technicians')) return [{ label: 'Technician Roster' }];
    if (path.includes('/app/property')) {
      return [{ label: 'Property' }];
    }
    if (path.includes('/app/settings')) return [{ label: 'Account Settings' }];
    return [{ label: 'Dashboard' }];
  };

  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });

  // Enable live real-time synchronization when session is loaded
  useRealtimeTickets(Boolean(session?.user));

  const logout = useMutation({
    mutationFn: () => apiRequest<{ message: string }>('/api/auth/logout', { method: 'POST' }),
    onSettled: () => {
      disconnectSocket();
      queryClient.removeQueries({ queryKey: ['current-user'] });
      queryClient.removeQueries({ queryKey: ['tickets'] });
      navigate('/login');
    },
  });

  // Manager properties list for active property display & switching
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => apiRequest<{ properties: ManagedProperty[] }>('/api/property/all'),
    enabled: session?.user?.role === 'manager',
  });

  const switchPropertyMutation = useMutation({
    mutationFn: (propertyId: string) =>
      apiRequest('/api/property/switch', {
        method: 'POST',
        body: JSON.stringify({ propertyId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      queryClient.invalidateQueries({ queryKey: ['properties-list'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  if (isSessionLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8FAFC] text-[#393053]">
        Restoring your secure session…
      </div>
    );
  }

  if (isSessionError || !session) {
    return <Navigate to="/login" replace />;
  }

  const user = session.user;
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const activeProperty =
    propertiesData?.properties?.find((p) => p.isActive) || propertiesData?.properties?.[0];

  // Role-specific navigation items
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/app/dashboard' },
    {
      label: user.role === 'tenant' ? 'My Tickets' : user.role === 'technician' ? 'Assigned Tickets' : 'Tickets',
      icon: ClipboardList,
      to: '/app/tickets',
    },
    ...(user.role === 'manager'
      ? [
          { label: 'Residents', icon: UsersRound, to: '/app/residents' },
          { label: 'Technicians', icon: Wrench, to: '/app/technicians' },
          { label: 'Property', icon: Building2, to: '/app/property' },
        ]
      : [{ label: 'Building Info', icon: Building2, to: '/app/property' }]),
    { label: 'Settings', icon: Settings, to: '/app/settings' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app/tickets');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[#18122B]/45 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/10 bg-[#18122B] px-4 py-5 transition-all duration-300 ${
          collapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-2">
          <Brand compact={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:block"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3 text-left">
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#30AFFF]/15 text-[#92EEFF]">
                <Building2 size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">
                  {activeProperty ? activeProperty.name : 'Your property'}
                </span>
                <span className="block text-xs capitalize text-slate-400">{user.role} workspace</span>
              </span>
            </div>

            {user.role === 'manager' && (propertiesData?.properties?.length ?? 0) > 1 && (
              <div className="mt-2.5 pt-2 border-t border-white/10">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                  Active Property:
                </label>
                <select
                  value={user.propertyId}
                  onChange={(e) => switchPropertyMutation.mutate(e.target.value)}
                  disabled={switchPropertyMutation.isPending}
                  className="w-full rounded-lg bg-black/40 border border-white/15 px-2 py-1.5 text-xs text-white outline-none hover:border-white/30 focus:border-[#92EEFF]"
                >
                  {propertiesData?.properties.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#18122B] text-white">
                      {p.name} {p.isActive ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Action Button for Tenants */}
        {user.role === 'tenant' && !collapsed && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#635985] py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-[#635985]/25 hover:bg-[#393053]"
          >
            <Plus size={18} /> Report an Issue
          </button>
        )}

        <nav className="mt-8 space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Workspace
            </p>
          )}
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#635985] text-white shadow-lg shadow-[#635985]/20'
                    : 'text-slate-400 hover:bg-white/7 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 border-t border-white/10 px-2 pt-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="size-9 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-[#D8FFC5] text-sm font-bold text-[#393053]">
                {initials}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs capitalize text-slate-400">{user.role}</p>
              </div>
            )}
            <button
              onClick={() => logout.mutate()}
              aria-label="Sign out"
              className="text-slate-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'lg:pl-[88px]' : 'lg:pl-[280px]'
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 bg-white/90 px-3.5 sm:px-6 lg:px-8 backdrop-blur dark:border-white/10 dark:bg-[#18122B]/90">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden shrink-0"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/app/dashboard" className="hover:text-[#18122B] dark:hover:text-white transition-colors font-medium">
                Workspace
              </Link>
              {getBreadcrumbs().map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-slate-400" />
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-[#18122B] dark:hover:text-white transition-colors font-medium">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-bold text-[#18122B] dark:text-white">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden xl:block ml-4 pl-4 border-l border-slate-200 dark:border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Signed in as</p>
              <p className="text-xs font-semibold text-[#18122B] dark:text-white">{user.email}</p>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearchSubmit} className="relative hidden w-64 lg:w-80 md:block">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-[#635985] focus:ring-2 focus:ring-[#635985]/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
                placeholder="Search tickets by title..."
              />
            </form>

            {user.role === 'tenant' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#635985] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053]"
              >
                <Plus size={15} /> Report issue
              </button>
            )}

            <ThemeToggle />
            <NotificationDropdown />

            {/* Profile Button - Directs directly to Profile in Settings */}
            <Link
              to="/app/settings#profile"
              className="group relative grid size-10 shrink-0 place-items-center rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/15 transition-all hover:ring-2 hover:ring-[#635985] focus:outline-none focus:ring-2 focus:ring-[#635985]"
              title={`${user.name} — Profile & Settings`}
              aria-label="View Profile & Settings"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="grid size-full place-items-center bg-[#635985] text-xs font-bold text-white transition group-hover:bg-[#393053]">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-5 lg:p-8">
          {children}
        </main>
      </div>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newTicket) => {
          navigate(`/app/tickets/${newTicket._id}`);
        }}
      />
    </div>
  );
}
