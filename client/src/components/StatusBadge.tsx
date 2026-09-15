import { displayStatus } from '../lib/format';
import type { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket';

const statusClasses: Record<TicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950/50 dark:text-[#92EEFF] dark:ring-blue-400/30',
  assigned: 'bg-violet-50 text-violet-700 ring-violet-600/10 dark:bg-purple-950/50 dark:text-[#D4C7F2] dark:ring-purple-400/30',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-400/30',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-400/30',
  closed: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-600/30',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const classes = statusClasses[status] ?? 'bg-slate-50 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}>
      {displayStatus(status)}
    </span>
  );
}

const priorityClasses: Record<TicketPriority, string> = {
  urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20 font-bold dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-400/30',
  high: 'bg-orange-50 text-orange-700 ring-orange-600/20 font-semibold dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-400/30',
  medium: 'bg-amber-50 text-amber-700 ring-amber-600/20 font-medium dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-400/30',
  low: 'bg-slate-50 text-slate-600 ring-slate-600/10 font-medium dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/20',
  unassigned: 'bg-purple-50 text-purple-700 ring-purple-600/10 font-medium dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-400/30',
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
    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200 dark:border dark:border-white/10 shadow-xs">
      {displayStatus(category)}
    </span>
  );
}
