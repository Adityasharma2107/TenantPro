import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
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
import { NavLink, Navigate, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import { useRealtimeTickets } from '../hooks/useRealtimeTickets';
import type { CurrentUser } from '../types/ticket';
import { Brand } from './Brand';
import { CreateTicketModal } from './CreateTicketModal';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      : []),
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
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left">
            <span className="grid size-8 place-items-center rounded-lg bg-[#30AFFF]/15 text-[#92EEFF]">
              <Building2 size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">Your property</span>
              <span className="block text-xs capitalize text-slate-400">{user.role} workspace</span>
            </span>
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
            <div className="grid size-9 place-items-center rounded-full bg-[#D8FFC5] text-sm font-bold text-[#393053]">
              {initials}
            </div>
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
        <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-[#18122B]">{user.email}</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative ml-auto hidden w-full max-w-sm md:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#635985] focus:ring-4 focus:ring-[#635985]/10"
              placeholder="Search tickets by title or location..."
            />
          </form>

          {user.role === 'tenant' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#635985] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053]"
            >
              <Plus size={16} /> Report issue
            </button>
          )}

          <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <div className="grid size-9 place-items-center rounded-full bg-[#393053] text-xs font-bold text-white">
            {initials}
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
