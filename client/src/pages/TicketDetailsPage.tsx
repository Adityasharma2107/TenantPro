import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Edit3,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Save,
  Send,
  User,
  Wrench,
  X,
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

const currencyOptions = [
  { symbol: '$', code: 'USD', label: '$ - USD / CAD / AUD' },
  { symbol: '€', code: 'EUR', label: '€ - Euro (EUR)' },
  { symbol: '£', code: 'GBP', label: '£ - British Pound (GBP)' },
  { symbol: '₹', code: 'INR', label: '₹ - Indian Rupee (INR)' },
  { symbol: '¥', code: 'JPY/CNY', label: '¥ - Yen / Yuan (JPY / CNY)' },
  { symbol: '₩', code: 'KRW', label: '₩ - South Korean Won (KRW)' },
  { symbol: 'CHF', code: 'CHF', label: 'CHF - Swiss Franc (CHF)' },
  { symbol: 'C$', code: 'CAD', label: 'C$ - Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', label: 'A$ - Australian Dollar (A$)' },
  { symbol: 'R$', code: 'BRL', label: 'R$ - Brazilian Real (R$)' },
  { symbol: 'AED', code: 'AED', label: 'AED - UAE Dirham (AED)' },
  { symbol: '﷼', code: 'SAR', label: '﷼ - Saudi Riyal (SAR)' },
  { symbol: 'kr', code: 'SEK/NOK', label: 'kr - Nordic Krona (kr)' },
  { symbol: '₱', code: 'PHP', label: '₱ - Philippine Peso (₱)' },
  { symbol: '₫', code: 'VND', label: '₫ - Vietnamese Dong (₫)' },
  { symbol: '₦', code: 'NGN', label: '₦ - Nigerian Naira (₦)' },
  { symbol: 'R', code: 'ZAR', label: 'R - South African Rand (R)' },
  { symbol: 'zł', code: 'PLN', label: 'zł - Polish Zloty (zł)' },
  { symbol: '฿', code: 'THB', label: '฿ - Thai Baht (฿)' },
  { symbol: 'KSh', code: 'KES', label: 'KSh - Kenyan Shilling (KSh)' },
  { symbol: '₨', code: 'PKR', label: '₨ - Pakistani Rupee (₨)' },
  { symbol: 'S$', code: 'SGD', label: 'S$ - Singapore Dollar (S$)' },
  { symbol: 'NZ$', code: 'NZD', label: 'NZ$ - New Zealand Dollar (NZ$)' },
  { symbol: 'HK$', code: 'HKD', label: 'HK$ - Hong Kong Dollar (HK$)' },
];

export function TicketDetailsPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);
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

  // 6. Expense Editing State & Mutation
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [currency, setCurrency] = useState('$');
  const [partsCost, setPartsCost] = useState<number | string>(0);
  const [laborHours, setLaborHours] = useState<number | string>(0);
  const [laborRate, setLaborRate] = useState<number | string>(0);
  const [totalCost, setTotalCost] = useState<number | string>(0);
  const [expenseNotes, setExpenseNotes] = useState('');

  const startEditingExpense = () => {
    const exp = data?.ticket?.expense;
    setCurrency(exp?.currency || '$');
    setPartsCost(exp?.partsCost ?? 0);
    setLaborHours(exp?.laborHours ?? 0);
    setLaborRate(exp?.laborRate ?? 0);
    setTotalCost(exp?.totalCost ?? 0);
    setExpenseNotes(exp?.notes || '');
    setIsEditingExpense(true);
  };

  const handlePartsChange = (val: string) => {
    setPartsCost(val);
    const p = parseFloat(val) || 0;
    const h = parseFloat(String(laborHours)) || 0;
    const r = parseFloat(String(laborRate)) || 0;
    setTotalCost(Number((p + h * r).toFixed(2)));
  };

  const handleLaborHoursChange = (val: string) => {
    setLaborHours(val);
    const p = parseFloat(String(partsCost)) || 0;
    const h = parseFloat(val) || 0;
    const r = parseFloat(String(laborRate)) || 0;
    setTotalCost(Number((p + h * r).toFixed(2)));
  };

  const handleLaborRateChange = (val: string) => {
    setLaborRate(val);
    const p = parseFloat(String(partsCost)) || 0;
    const h = parseFloat(String(laborHours)) || 0;
    const r = parseFloat(val) || 0;
    setTotalCost(Number((p + h * r).toFixed(2)));
  };

  const updateExpenseMutation = useMutation({
    mutationFn: (body: {
      currency: string;
      partsCost: number;
      laborHours: number;
      laborRate: number;
      totalCost: number;
      notes?: string;
    }) =>
      apiRequest(`/api/tickets/${ticketId}/expense`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsEditingExpense(false);
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Could not update expense.');
    },
  });

  const handleExpenseSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateExpenseMutation.mutate({
      currency,
      partsCost: Number(partsCost) || 0,
      laborHours: Number(laborHours) || 0,
      laborRate: Number(laborRate) || 0,
      totalCost: Number(totalCost) || 0,
      notes: expenseNotes,
    });
  };

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

            {ticket.imageUrls && ticket.imageUrls.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <ImageIcon size={14} className="text-[#635985]" />
                  <span>Attached Photos ({ticket.imageUrls.length})</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {ticket.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLightboxUrl(url)}
                      className="group relative size-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#635985]"
                      title="Click to view full size"
                    >
                      <img
                        src={url}
                        alt={`Attachment ${idx + 1}`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
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

            {/* Maintenance Cost & Expense Tracking */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Coins size={14} className="text-[#635985]" />
                  <p className="text-xs font-bold text-slate-700">Repair Cost & Parts</p>
                </div>
                {(user?.role === 'manager' || user?.role === 'technician') && !isEditingExpense && (
                  <button
                    onClick={startEditingExpense}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#635985] hover:text-[#393053] hover:underline"
                  >
                    <Edit3 size={12} /> {ticket.expense?.totalCost ? 'Edit' : 'Record Cost'}
                  </button>
                )}
              </div>

              {isEditingExpense ? (
                <form onSubmit={handleExpenseSubmit} className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  {/* Currency Selection Dropdown */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#635985]"
                    >
                      {currencyOptions.map((c) => (
                        <option key={c.code} value={c.symbol}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Parts ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={partsCost}
                        onChange={(e) => handlePartsChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-[#635985]"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Labor (Hrs)
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={laborHours}
                        onChange={(e) => handleLaborHoursChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-[#635985]"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Labor Rate ({currency}/hr)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={laborRate}
                        onChange={(e) => handleLaborRateChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-[#635985]"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">
                        Total Recorded ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={totalCost}
                        onChange={(e) => setTotalCost(e.target.value)}
                        className="w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs font-bold text-emerald-700 outline-none focus:border-emerald-600"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Notes / Replacement Items
                    </label>
                    <input
                      type="text"
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      placeholder="e.g. Replaced shut-off valve and washer"
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-[#635985]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingExpense(false)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateExpenseMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#635985] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#393053] disabled:opacity-50"
                    >
                      <Save size={13} /> {updateExpenseMutation.isPending ? 'Saving…' : 'Save Expense'}
                    </button>
                  </div>
                </form>
              ) : ticket.expense && (ticket.expense.totalCost > 0 || ticket.expense.partsCost > 0 || ticket.expense.laborHours > 0) ? (
                <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parts Allocation:</span>
                    <span className="font-semibold text-slate-800">
                      {ticket.expense.currency || '$'}{(ticket.expense.partsCost || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Labor Time:</span>
                    <span className="font-semibold text-slate-800">
                      {ticket.expense.laborHours || 0} Hours
                      {ticket.expense.laborRate ? ` (@ ${ticket.expense.currency || '$'}${ticket.expense.laborRate}/hr)` : ''}
                    </span>
                  </div>
                  {ticket.expense.notes && (
                    <div className="pt-1 text-[11px] text-slate-500 italic">
                      "{ticket.expense.notes}"
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200/60 pt-1.5 font-bold text-[#18122B]">
                    <span>Total Recorded:</span>
                    <span className="text-emerald-700">
                      {ticket.expense.currency || '$'}{(ticket.expense.totalCost || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  No repair costs recorded for this ticket yet.
                  {(user?.role === 'manager' || user?.role === 'technician') && (
                    <button
                      onClick={startEditingExpense}
                      className="mt-1.5 block mx-auto text-xs font-bold text-[#635985] hover:underline"
                    >
                      + Record Parts & Labor Cost
                    </button>
                  )}
                </div>
              )}
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

      {/* Lightbox Modal */}
      {activeLightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18122B]/85 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveLightboxUrl(null)}
            className="absolute top-5 right-5 rounded-xl bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>
          <img
            src={activeLightboxUrl}
            alt="Full size attachment"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
