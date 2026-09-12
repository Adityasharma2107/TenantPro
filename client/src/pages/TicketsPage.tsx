import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Wrench,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { timeAgo } from '../lib/format';
import type {
  CurrentUser,
  TicketCategory,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
} from '../types/ticket';

export function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';
  const category = searchParams.get('category') ?? '';

  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;

  // Build query string for API
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', '15');
  if (search) queryParams.set('search', search);
  if (status) queryParams.set('status', status);
  if (priority) queryParams.set('priority', priority);
  if (category) queryParams.set('category', category);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tickets', queryParams.toString()],
    queryFn: () =>
      apiRequest<TicketListResponse>(`/api/tickets?${queryParams.toString()}`),
  });

  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 15, total: 0, totalPages: 1 };

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#18122B]">
            {user?.role === 'tenant' ? 'My Maintenance Tickets' : 'Property Tickets'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.role === 'tenant'
              ? 'View and manage all issues you have reported.'
              : 'Track, assign, and resolve maintenance requests across the property.'}
          </p>
        </div>

        {user?.role === 'tenant' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635985] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053]"
          >
            <Plus size={18} /> Report an Issue
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search tickets..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#635985] focus:bg-white focus:ring-2 focus:ring-[#635985]/15"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none focus:border-[#635985] focus:bg-white focus:ring-2 focus:ring-[#635985]/15"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priority}
            onChange={(e) => updateParam('priority', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none focus:border-[#635985] focus:bg-white focus:ring-2 focus:ring-[#635985]/15"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="unassigned">Review needed (Unassigned)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none focus:border-[#635985] focus:bg-white focus:ring-2 focus:ring-[#635985]/15"
          >
            <option value="">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="security">Security</option>
            <option value="appliance">Appliance</option>
            <option value="internet">Internet</option>
            <option value="cleaning">Cleaning</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="grid min-h-[300px] place-items-center text-slate-500">
            Loading tickets...
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-rose-600">Failed to load tickets.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs font-semibold text-[#635985] underline"
            >
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Filter size={32} className="mx-auto text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-[#18122B]">No tickets found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or filters, or submit a new maintenance request.
            </p>
            {user?.role === 'tenant' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#635985] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#393053]"
              >
                <Plus size={16} /> Report issue
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Ticket</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Location</th>
                  {user?.role !== 'tenant' && <th className="px-4 py-3.5">Tenant</th>}
                  <th className="px-4 py-3.5">Assigned To</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => {
                  const tenantInfo = typeof t.tenant === 'object' ? t.tenant : null;
                  const techInfo = typeof t.assignedTechnician === 'object' ? t.assignedTechnician : null;

                  return (
                    <tr
                      key={t._id}
                      onClick={() => navigate(`/app/tickets/${t._id}`)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-[#635985]">
                          #{t._id.slice(-5).toUpperCase()}
                        </span>
                        <p className="font-semibold text-[#18122B] mt-0.5 line-clamp-1">{t.title}</p>
                      </td>
                      <td className="px-4 py-4">
                        <CategoryBadge category={t.category as TicketCategory} />
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{t.location}</td>
                      {user?.role !== 'tenant' && (
                        <td className="px-4 py-4 text-slate-600">
                          {tenantInfo ? (
                            <div>
                              <p className="font-medium text-slate-900">{tenantInfo.name}</p>
                              {tenantInfo.unitNumber && (
                                <p className="text-xs text-slate-400">Unit {tenantInfo.unitNumber}</p>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      <td className="px-4 py-4">
                        {techInfo ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Wrench size={14} className="text-[#635985]" />
                            <span className="font-medium">{techInfo.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={t.priority as TicketPriority} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={t.status as TicketStatus} />
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500">
                        {timeAgo(t.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.total} total tickets)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newTicket) => navigate(`/app/tickets/${newTicket._id}`)}
      />
    </div>
  );
}
