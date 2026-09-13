import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, UserCheck, Users, Wrench, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { TeamMember } from '../types/ticket';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  initialRole?: 'tenant' | 'technician';
  onClose: () => void;
  onSuccess?: (user: TeamMember) => void;
}

const specializations = [
  'Plumbing',
  'Electrical',
  'HVAC / Air Conditioning',
  'Appliance Repair',
  'Carpentry',
  'Painting & Drywall',
  'Security & Locks',
  'General Maintenance',
];

export function AddTeamMemberModal({
  isOpen,
  initialRole = 'tenant',
  onClose,
  onSuccess,
}: AddTeamMemberModalProps) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'tenant' | 'technician'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest<{ message: string; user: TeamMember }>('/api/team/users', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setError('');
      if (onSuccess) onSuccess(data.user);
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Unable to create team member.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    const payload: Record<string, unknown> = {
      name,
      email,
      password,
      role,
    };

    if (role === 'tenant') {
      const unitNumber = String(form.get('unitNumber') ?? '').trim();
      if (!unitNumber) {
        setError('Unit number is required for a resident.');
        return;
      }
      payload.unitNumber = unitNumber;
    } else {
      const specialization = String(form.get('specialization') ?? '').trim();
      if (specialization) {
        payload.specialization = specialization;
      }
    }

    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="fixed inset-0 bg-[#18122B]/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#635985]/10 text-[#635985]">
              {role === 'tenant' ? <Users size={18} /> : <Wrench size={18} />}
            </span>
            <div>
              <h2 className="text-xl font-bold text-[#18122B]">
                {role === 'tenant' ? 'Onboard Resident' : 'Add Technician'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {role === 'tenant'
                  ? 'Assign an apartment unit and create login credentials.'
                  : 'Add a maintenance specialist for repair assignments.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Role Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Account Type
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
                  role === 'tenant'
                    ? 'bg-[#635985] text-white shadow-sm'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users size={15} /> Resident / Tenant
              </button>
              <button
                type="button"
                onClick={() => setRole('technician')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
                  role === 'technician'
                    ? 'bg-[#635985] text-white shadow-sm'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Wrench size={15} /> Technician
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="member-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Full Name
            </label>
            <input
              id="member-name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              placeholder={role === 'tenant' ? 'e.g. Priya Sharma' : 'e.g. Ramesh Kumar'}
              className="auth-input mt-1.5"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="member-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Email Address
            </label>
            <input
              id="member-email"
              name="email"
              type="email"
              required
              placeholder={role === 'tenant' ? 'tenant@example.com' : 'technician@example.com'}
              className="auth-input mt-1.5"
            />
          </div>

          {/* Conditional: Unit Number for Tenant */}
          {role === 'tenant' ? (
            <div>
              <label htmlFor="member-unit" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Unit / Apartment Number
              </label>
              <input
                id="member-unit"
                name="unitNumber"
                required
                maxLength={30}
                placeholder="e.g. Unit 302, Tower B"
                className="auth-input mt-1.5"
              />
              <p className="mt-1 text-xs text-slate-400">
                Residents will see this pre-filled on their maintenance complaints.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="member-specialization" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Trade Specialization
              </label>
              <select
                id="member-specialization"
                name="specialization"
                defaultValue="General Maintenance"
                className="auth-input mt-1.5"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">
                Shown to managers when assigning technicians to maintenance tickets.
              </p>
            </div>
          )}

          {/* Temporary Password */}
          <div>
            <label htmlFor="member-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Temporary Password
            </label>
            <div className="relative">
              <input
                id="member-password"
                name="password"
                required
                type={showPassword ? 'text' : 'password'}
                className="auth-input mt-1.5 pr-16"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#635985]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              At least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#635985] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] disabled:opacity-50"
            >
              <UserCheck size={16} />
              {mutation.isPending ? 'Onboarding…' : role === 'tenant' ? 'Create Resident' : 'Create Technician'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
