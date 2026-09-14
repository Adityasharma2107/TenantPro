import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import type { CurrentUser } from '../types/ticket';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;

  // Profile Form States
  const [name, setName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification Preferences States (Persisted in localStorage)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('tenantpro_settings_notifications');
      return saved
        ? JSON.parse(saved)
        : {
            ticketUpdates: true,
            assignments: true,
            comments: true,
            soundAlerts: false,
          };
    } catch {
      return {
        ticketUpdates: true,
        assignments: true,
        comments: true,
        soundAlerts: false,
      };
    }
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUnitNumber(user.unitNumber || '');
      setSpecialization(user.specialization || '');
    }
  }, [user]);

  const toggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      localStorage.setItem('tenantpro_settings_notifications', JSON.stringify(updated));
    } catch {
      // Ignore local storage errors
    }
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('TenantPro Workspace', {
        body: 'Real-time push notifications are active for work orders.',
        icon: '/favicon.svg',
      });
      return;
    }
    const res = await Notification.requestPermission();
    if (res === 'granted') {
      new Notification('TenantPro Workspace', {
        body: 'Notifications enabled successfully!',
        icon: '/favicon.svg',
      });
    }
  };

  // Profile Update Mutation
  const profileMutation = useMutation({
    mutationFn: (payload: { name: string; unitNumber?: string; specialization?: string }) =>
      apiRequest<{ message: string; user: CurrentUser }>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['current-user'], { user: data.user });
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (err: any) => {
      setProfileError(err.message || 'Failed to update profile.');
      setProfileSuccess('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    profileMutation.mutate({
      name,
      unitNumber: user?.role === 'tenant' ? unitNumber : undefined,
      specialization: user?.role === 'technician' ? specialization : undefined,
    });
  };

  // Password Change Mutation
  const passwordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      apiRequest<{ message: string }>('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully!');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    },
    onError: (err: any) => {
      setPasswordError(err.message || 'Failed to change password.');
      setPasswordSuccess('');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, and numeric characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  };

  // Logout Mutation
  const logout = useMutation({
    mutationFn: () => apiRequest<{ message: string }>('/api/auth/logout', { method: 'POST' }),
    onSettled: () => {
      disconnectSocket();
      queryClient.removeQueries({ queryKey: ['current-user'] });
      queryClient.removeQueries({ queryKey: ['tickets'] });
      navigate('/login');
    },
  });

  const initials = (user?.name || 'User')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Password strength checker
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header & Avatar Banner */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#635985] to-[#393053] text-xl font-bold text-white shadow-lg shadow-[#635985]/20">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#18122B]">{user?.name}</h1>
              <span className="rounded-full bg-[#635985]/10 px-2.5 py-0.5 text-xs font-bold capitalize text-[#635985]">
                {user?.role}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => logout.mutate()}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:self-auto"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Section 1: Profile Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="grid size-8 place-items-center rounded-lg bg-[#635985]/10 text-[#635985]">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18122B]">Personal Profile</h2>
              <p className="text-xs text-slate-500">Update how your identity appears on work orders</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle size={16} />
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                  Read Only
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Email changes require administrator or manager authorization.
              </p>
            </div>

            {user?.role === 'tenant' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Assigned Unit Number
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g. Unit 4B"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                />
              </div>
            )}

            {user?.role === 'technician' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Trade Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Master Plumber, HVAC, Electrical"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#635985] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] disabled:opacity-50"
              >
                {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Security & Password */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18122B]">Security & Password</h2>
              <p className="text-xs text-slate-500">Update your login password and protect account access</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle size={16} />
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Current Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                New Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters with numbers"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all ${
                          strengthScore >= step
                            ? strengthScore <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className={hasMinLength ? 'text-emerald-600 font-semibold' : ''}>
                      {hasMinLength ? '✓' : '•'} 8+ characters
                    </span>
                    <span className={hasUpper && hasLower ? 'text-emerald-600 font-semibold' : ''}>
                      {hasUpper && hasLower ? '✓' : '•'} Upper & lower case
                    </span>
                    <span className={hasNumber ? 'text-emerald-600 font-semibold' : ''}>
                      {hasNumber ? '✓' : '•'} At least 1 number
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50"
              >
                <KeyRound size={15} />
                {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Bell size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18122B]">Notification Preferences</h2>
              <p className="text-xs text-slate-500">Configure how and when you receive maintenance updates</p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-[#18122B]">Ticket Status Changes</p>
                <p className="text-xs text-slate-500">
                  Notify me in real-time when work orders move between open, in-progress, and resolved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('ticketUpdates')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.ticketUpdates ? 'bg-[#635985]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.ticketUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-[#18122B]">Assignment & Dispatch Alerts</p>
                <p className="text-xs text-slate-500">
                  Get notified when a technician is assigned to an active repair or when a schedule changes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('assignments')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.assignments ? 'bg-[#635985]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.assignments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-[#18122B]">Discussion & Activity Replies</p>
                <p className="text-xs text-slate-500">
                  Receive alerts when technicians or property staff comment on tickets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('comments')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.comments ? 'bg-[#635985]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.comments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-[#18122B]">Emergency Sound Chime</p>
                <p className="text-xs text-slate-500">
                  Play an audible alert chime when high priority or urgent tickets are updated.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('soundAlerts')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.soundAlerts ? 'bg-[#635985]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.soundAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Desktop Notification Permission */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-[#18122B]">Browser Desktop Alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Receive native popups on your device when work orders change.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestNotification}
                  className="rounded-xl bg-[#635985] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#393053] transition"
                >
                  Enable / Test Alerts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Workspace & Active Session */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <Shield size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#18122B]">Active Session & System</h2>
                <p className="text-xs text-slate-500">Security diagnostics and environment details</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Account Role</span>
                <span className="font-bold capitalize text-[#18122B]">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Theme Appearance</span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
                  <span className="rounded-md bg-[#635985] px-2 py-0.5 text-white shadow-sm">Light</span>
                  <span className="px-2 py-0.5 text-slate-400">Dark (Auto)</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Account ID</span>
                <span className="font-mono text-slate-700">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Property ID</span>
                <span className="font-mono text-slate-700">{user?.propertyId}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Real-Time Sync</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  WebSocket Active
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <button
              onClick={() => logout.mutate()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-rose-700"
            >
              <LogOut size={15} /> End Session & Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
