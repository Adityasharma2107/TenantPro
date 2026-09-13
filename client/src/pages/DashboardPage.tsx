import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock3,
  Layers,
  Plus,
  Timer,
  Wrench,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { MetricCard } from '../components/MetricCard';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { displayStatus, timeAgo } from '../lib/format';
import type { AnalyticsData, CurrentUser, Ticket, TicketStatus } from '../types/ticket';

export function DashboardPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => apiRequest<{ tickets: Ticket[] }>('/api/tickets?limit=100'),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiRequest<AnalyticsData>('/api/analytics'),
  });

  const tickets = data?.tickets ?? [];
  const count = (status: TicketStatus) => tickets.filter((t) => t.status === status).length;

  const statuses: [string, TicketStatus, string][] = [
    ['Open', 'open', 'bg-[#30AFFF]'],
    ['Assigned', 'assigned', 'bg-[#635985]'],
    ['In progress', 'in_progress', 'bg-amber-400'],
    ['Resolved', 'resolved', 'bg-emerald-500'],
  ];

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-slate-500">
        Loading your maintenance data…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-7 rounded-xl bg-rose-50 p-4 text-rose-700">
        Could not load tickets. Ensure the TenantPro API is running, then refresh.
      </div>
    );
  }

  const categoryBreakdown = analytics?.byCategory ?? {};
  const maxCategoryCount = Math.max(1, ...Object.values(categoryBreakdown));

  return (
    <>
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[#635985]">{today}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#18122B]">
            {user?.role === 'tenant'
              ? 'Resident Portal'
              : user?.role === 'technician'
              ? 'Technician Work Queue'
              : 'Your maintenance overview.'}
          </h1>
          <p className="mt-2 text-slate-500">
            {user?.role === 'tenant'
              ? 'Track your ongoing maintenance requests and submit new ones.'
              : user?.role === 'technician'
              ? 'View tasks assigned to you and update your progress.'
              : 'Here is what needs your attention today.'}
          </p>
        </div>

        {user?.role === 'tenant' ? (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635985] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635985]/20 hover:bg-[#393053]"
          >
            <Plus size={18} /> Report an issue
          </button>
        ) : (
          <Link
            to="/app/tickets"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635985] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#635985]/20 hover:bg-[#393053]"
          >
            View all tickets <ArrowUpRight size={16} />
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {user?.role === 'technician' ? (
          <>
            <MetricCard
              label="Assigned"
              value={String(count('assigned'))}
              detail="Ready for pickup"
              icon={ClipboardList}
              tone="bg-violet-50 text-[#635985]"
            />
            <MetricCard
              label="In progress"
              value={String(count('in_progress'))}
              detail="Active repairs"
              icon={Clock3}
              tone="bg-amber-50 text-amber-600"
            />
            <MetricCard
              label="Urgent"
              value={String(tickets.filter((t) => t.priority === 'urgent').length)}
              detail="High priority"
              icon={CircleAlert}
              tone="bg-rose-50 text-rose-600"
            />
            <MetricCard
              label="Resolved"
              value={String(count('resolved'))}
              detail="Completed repairs"
              icon={CircleCheck}
              tone="bg-emerald-50 text-emerald-600"
            />
          </>
        ) : (
          <>
            <MetricCard
              label={user?.role === 'tenant' ? 'My open requests' : 'Open tickets'}
              value={String(count('open'))}
              detail="Awaiting review"
              icon={ClipboardList}
              tone="bg-blue-50 text-[#30AFFF]"
            />
            <MetricCard
              label="Avg resolution speed"
              value={
                analytics?.summary.avgResolutionHours
                  ? `${analytics.summary.avgResolutionHours} hrs`
                  : 'N/A'
              }
              detail="Turnaround time"
              icon={Timer}
              tone="bg-teal-50 text-teal-600"
            />
            <MetricCard
              label="In progress"
              value={String(count('in_progress'))}
              detail="Technicians are working"
              icon={Clock3}
              tone="bg-amber-50 text-amber-600"
            />
            <MetricCard
              label="Property health"
              value={`${analytics?.summary.healthScore ?? 100}%`}
              detail="Completed repairs"
              icon={Activity}
              tone="bg-emerald-50 text-emerald-600"
            />
          </>
        )}
      </section>

      {/* Main split: Recent Tickets Table + Status Card */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-[#18122B]">
                {user?.role === 'tenant' ? 'My maintenance tickets' : 'Recent tickets'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {user?.role === 'tenant'
                  ? 'Your active and past reports'
                  : 'Latest maintenance activity across property'}
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#635985]"
              to="/app/tickets"
            >
              View all <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Ticket</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length ? (
                  tickets.slice(0, 5).map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => navigate(`/app/tickets/${ticket._id}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#393053]">
                          #{ticket._id.slice(-5).toUpperCase()}
                        </p>
                        <p className="mt-1 font-medium text-slate-700">{ticket.title}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{ticket.location}</td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {timeAgo(ticket.updatedAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      {user?.role === 'tenant' ? (
                        <div>
                          <p className="font-medium">You have no maintenance tickets yet.</p>
                          <button
                            onClick={() => setIsCreateOpen(true)}
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#635985]"
                          >
                            <Plus size={16} /> Submit your first request
                          </button>
                        </div>
                      ) : (
                        'No maintenance tickets found.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#18122B]">Ticket status</h2>
          <p className="mt-1 text-sm text-slate-500">Current workload overview</p>

          <div className="mt-9 space-y-5">
            {statuses.map(([label, status, color]) => (
              <div key={status}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{label}</span>
                  <span className="font-semibold text-[#18122B]">{count(status)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    style={{
                      width: `${tickets.length ? (count(status) / tickets.length) * 100 : 0}%`,
                    }}
                    className={`h-2 rounded-full ${color} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-[#D8FFC5]/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Property health
            </p>
            <p className="mt-1 text-sm font-medium text-[#18122B]">
              {analytics?.summary.healthScore !== undefined
                ? `${analytics.summary.healthScore}% of all maintenance requests resolved.`
                : 'Create your first ticket to begin tracking property health.'}
            </p>
          </div>
        </article>
      </section>

      {/* Operational Analytics & Workload Breakdown */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Category Breakdown */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#635985]" />
            <h2 className="font-semibold text-[#18122B]">Tickets by Category</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Distribution of reported maintenance trades</p>

          <div className="mt-6 space-y-3.5">
            {Object.entries(categoryBreakdown).map(([category, countVal]) => (
              <div key={category}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{displayStatus(category)}</span>
                  <span className="font-bold text-slate-800">{countVal}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${(countVal / maxCategoryCount) * 100}%` }}
                    className="h-full rounded-full bg-[#635985]/80 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Technician Efficiency Leaderboard (for managers) */}
        {user?.role === 'manager' && (
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-[#635985]" />
              <h2 className="font-semibold text-[#18122B]">Technician Dispatch Efficiency</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Completed repairs vs active assignments</p>

            <div className="mt-6 space-y-4">
              {analytics?.technicianLeaderboard?.length ? (
                analytics.technicianLeaderboard.map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#18122B]">{tech.name}</p>
                      <p className="text-xs text-slate-400">
                        {tech.specialization || 'General Maintenance'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="block font-bold text-amber-700">{tech.activeCount} active</span>
                        <span className="text-[11px] text-slate-400">assigned</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-emerald-700">{tech.resolvedCount} done</span>
                        <span className="text-[11px] text-slate-400">resolved</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-slate-400">
                  No active technicians found. Onboard technicians to track dispatch velocity.
                </p>
              )}
            </div>
          </article>
        )}
      </section>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(ticket) => navigate(`/app/tickets/${ticket._id}`)}
      />
    </>
  );
}
