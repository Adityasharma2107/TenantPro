import { displayStatus } from '../lib/format';
import type { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket';

const statusClasses: Record<TicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-blue-600/10',
  assigned: 'bg-violet-50 text-violet-700 ring-violet-600/10',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  closed: 'bg-slate-100 text-slate-700 ring-slate-600/10',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const classes = statusClasses[status] ?? 'bg-slate-50 text-slate-700 ring-slate-600/10';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}>
      {displayStatus(status)}
    </span>
  );
}

const priorityClasses: Record<TicketPriority, string> = {
  urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20 font-bold',
  high: 'bg-orange-50 text-orange-700 ring-orange-600/20 font-semibold',
  medium: 'bg-amber-50 text-amber-700 ring-amber-600/20 font-medium',
  low: 'bg-slate-50 text-slate-600 ring-slate-600/10 font-medium',
  unassigned: 'bg-purple-50 text-purple-700 ring-purple-600/10 font-medium',
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const classes = priorityClasses[priority] ?? priorityClasses.unassigned;
  const label = priority === 'unassigned' ? 'Review needed' : displayStatus(priority);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${classes}`}>
      {label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {displayStatus(category)}
    </span>
  );
}
