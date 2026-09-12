import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  User,
  Wrench,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AssignTechnicianModal } from '../components/AssignTechnicianModal';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import { displayStatus, timeAgo } from '../lib/format';
import type {
  ActivityLogItem,
  CurrentUser,
  PopulatedUser,
  TicketCategory,
  TicketDetailsResponse,
  TicketPriority,
  TicketStatus,
} from '../types/ticket';

export function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  // 1. Current Session
  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;

  // 2. Ticket Details (with comments and activities)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiRequest<TicketDetailsResponse>(`/api/tickets/${ticketId}`),
    enabled: Boolean(ticketId),
  });

  // 3. Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setCommentText('');
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Could not add comment.');
    },
  });

  // 4. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: TicketStatus) =>
      apiRequest(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Could not update status.');
    },
  });

  // 5. Update Priority Mutation
  const updatePriorityMutation = useMutation({
    mutationFn: (priority: TicketPriority) =>
      apiRequest(`/api/tickets/${ticketId}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Could not update priority.');
    },
  });

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-slate-500">
        Loading ticket details…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Ticket not accessible</h2>
        <p className="mt-2 text-sm text-slate-500">
          This ticket may not exist, or your account does not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/app/tickets')}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#635985] px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} /> Back to tickets
        </button>
      </div>
    );
  }

  const { ticket, comments, activities } = data;
  const tenant = (typeof ticket.tenant === 'object' ? ticket.tenant : null) as PopulatedUser | null;
  const assignedTech = (typeof ticket.assignedTechnician === 'object'
    ? ticket.assignedTechnician
    : null) as PopulatedUser | null;

  const canManageAssignment = user?.role === 'manager';
  const canManagePriority = user?.role === 'manager';
  const canUpdateStatus =
    user?.role === 'manager' ||
    (user?.role === 'technician' &&
      typeof ticket.assignedTechnician === 'object' &&
      ticket.assignedTechnician?._id === user.id);

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/app/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#635985] transition-colors"
        >
          <ArrowLeft size={14} /> Back to all tickets
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#635985]">
                #{ticket._id.slice(-6).toUpperCase()}
              </span>
              <CategoryBadge category={ticket.category as TicketCategory} />
              <PriorityBadge priority={ticket.priority as TicketPriority} />
              <StatusBadge status={ticket.status as TicketStatus} />
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#18122B] sm:text-3xl">
              {ticket.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={14} /> Reported {timeAgo(ticket.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      {/* Main Grid: Details + Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.9fr_1.1fr]">
        {/* Left Column: Description & Comments */}
        <div className="space-y-6">
          {/* Overview Card */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Description & Details
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
              {ticket.description}
            </p>

            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[#30AFFF]">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-400">Location / Unit</p>
                  <p className="text-sm font-semibold text-slate-800">{ticket.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-[#635985]">
                  <Calendar size={18} />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-400">Last updated</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {ticket.resolvedAt && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                <CheckCircle2 size={16} />
                <span>
                  Resolved on{' '}
                  {new Date(ticket.resolvedAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
                </span>
              </div>
            )}
          </article>

          {/* Comments Discussion Card */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <MessageSquare size={18} className="text-[#635985]" />
              <h2 className="font-semibold text-[#18122B]">Discussion ({comments.length})</h2>
            </div>

            {/* Comment Thread */}
            <div className="mt-5 space-y-4">
              {comments.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No comments posted yet. Leave a message below to coordinate.
                </p>
              ) : (
                comments.map((comment) => {
                  const isCurrentAuthor = comment.author?._id === user?.id;
                  const authorRole = comment.author?.role;

                  return (
                    <div
                      key={comment._id}
                      className={`rounded-xl p-4 transition-colors ${
                        isCurrentAuthor
                          ? 'bg-[#635985]/5 border border-[#635985]/10'
                          : 'bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#18122B]">
                            {comment.author?.name}
                          </span>
                          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {authorRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                        {comment.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mt-6 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write an update or reply..."
                className="auth-input flex-1 !mt-0"
              />
              <button
                type="submit"
                disabled={addCommentMutation.isPending || !commentText.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#635985] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#393053] disabled:opacity-50"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </article>
        </div>

        {/* Right Column: Workflow Controls & Timeline */}
        <div className="space-y-6">
          {/* Actions Card */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Ticket Operations
            </h3>

            {/* Status Transition Buttons */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500">Update Status</label>
              {canUpdateStatus ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(user?.role === 'technician'
                    ? (['in_progress', 'resolved'] as TicketStatus[])
                    : (['open', 'assigned', 'in_progress', 'resolved', 'closed'] as TicketStatus[])
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={updateStatusMutation.isPending || ticket.status === s}
                      onClick={() => updateStatusMutation.mutate(s)}
                      className={`rounded-lg py-1.5 px-2 text-xs font-semibold transition-colors ${
                        ticket.status === s
                          ? 'bg-[#635985] text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                      }`}
                    >
                      {displayStatus(s)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-1.5">
                  <StatusBadge status={ticket.status as TicketStatus} />
                </div>
              )}
            </div>

            {/* Manager: Technician Assignment */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Assigned Technician</p>
                  <p className="text-sm font-semibold text-[#18122B] mt-0.5">
                    {assignedTech ? assignedTech.name : 'Unassigned'}
                  </p>
                  {assignedTech?.specialization && (
                    <p className="text-xs text-slate-400">{assignedTech.specialization}</p>
                  )}
                </div>

                {canManageAssignment && (
                  <button
                    onClick={() => setIsAssignOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#635985] hover:bg-slate-50 shadow-sm"
                  >
                    <Wrench size={14} />
                    {assignedTech ? 'Reassign' : 'Assign'}
                  </button>
                )}
              </div>
            </div>

            {/* Manager: Priority Adjustment */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">Priority Level</p>
              {canManagePriority ? (
                <div className="mt-2">
                  <select
                    value={ticket.priority}
                    onChange={(e) => updatePriorityMutation.mutate(e.target.value as TicketPriority)}
                    className="auth-input !mt-0 text-xs font-semibold"
                    disabled={updatePriorityMutation.isPending}
                  >
                    <option value="unassigned">Unassigned (Under Review)</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              ) : (
                <div className="mt-1.5">
                  <PriorityBadge priority={ticket.priority as TicketPriority} />
                </div>
              )}
            </div>

            {/* Resident / Tenant Info */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">Reported By</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600">
                  <User size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {tenant ? tenant.name : 'Resident'}
                  </p>
                  {tenant?.unitNumber && (
                    <p className="text-xs text-slate-400">Unit {tenant.unitNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Activity Timeline Card */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Audit Timeline
            </h3>

            <div className="mt-5 space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400">No activity recorded yet.</p>
              ) : (
                activities.map((act: ActivityLogItem, idx: number) => (
                  <div key={act._id} className="relative flex items-start gap-3">
                    {idx !== activities.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-0 w-px bg-slate-200 -z-0" />
                    )}
                    <span className="relative z-10 mt-1 size-2 rounded-full bg-[#635985] ring-4 ring-white" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">{act.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {act.actor?.name} ({act.actor?.role}) · {timeAgo(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>

      <AssignTechnicianModal
        isOpen={isAssignOpen}
        ticketId={ticket._id}
        currentTechnicianId={assignedTech?._id}
        onClose={() => setIsAssignOpen(false)}
      />
    </div>
  );
}
