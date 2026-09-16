import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { timeAgo } from '../lib/format';
import { getSocket } from '../lib/socket';
import type { NotificationItem } from '../types/ticket';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications'),
    refetchInterval: 30000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Real-time socket listener for incoming notifications
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [queryClient]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all notifications read
  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/notifications/mark-all-read', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markReadMutation.mutate(item._id);
    }
    setIsOpen(false);
    if (item.ticket?._id) {
      navigate(`/app/tickets/${item.ticket._id}`);
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ticket_assigned':
        return <Wrench size={16} className="text-purple-500" />;
      case 'status_changed':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'comment_added':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'expense_updated':
        return <Sparkles size={16} className="text-amber-500" />;
      default:
        return <AlertCircle size={16} className="text-[#635985]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#635985]/30 hover:bg-slate-50 hover:text-[#635985] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        title="View notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-[#18122B]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="fixed inset-x-3 top-18 sm:inset-x-auto sm:absolute sm:right-0 sm:top-12 z-50 sm:w-96 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 dark:border-white/10 dark:bg-[#1E1735]">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#18122B] dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#635985]/10 px-2 py-0.5 text-xs font-semibold text-[#635985] dark:bg-[#635985]/30 dark:text-[#92EEFF]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-[#635985] dark:text-slate-400 dark:hover:text-[#92EEFF]"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading alerts…</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
                  <Check size={20} />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  No new maintenance updates or notifications.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 dark:hover:bg-white/5 ${
                    !item.read ? 'bg-[#635985]/5 dark:bg-[#635985]/15' : ''
                  }`}
                >
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-white/10">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`truncate text-xs ${
                          !item.read
                            ? 'font-bold text-[#18122B] dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {item.message}
                    </p>
                    {item.ticket && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#635985] dark:text-[#92EEFF]">
                        View ticket <ExternalLink size={10} />
                      </span>
                    )}
                  </div>

                  {!item.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#30AFFF]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
