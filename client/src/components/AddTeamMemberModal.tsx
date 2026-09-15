import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Building2, UserCheck, Users, Wrench, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { ManagedProperty, TeamMember } from '../types/ticket';

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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => apiRequest<{ properties: ManagedProperty[] }>('/api/property/all'),
  });

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

    if (selectedPropertyId) {
      payload.propertyId = selectedPropertyId;
    }

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
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1E1735]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#635985]/10 text-[#635985] dark:bg-white/10 dark:text-[#92EEFF]">
              {role === 'tenant' ? <Users size={18} /> : <Wrench size={18} />}
            </span>
            <div>
              <h2 className="text-xl font-bold text-[#18122B] dark:text-white">
                {role === 'tenant' ? 'Onboard Resident' : 'Add Technician'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {role === 'tenant'
                  ? 'Assign an apartment unit and create login credentials.'
                  : 'Add a maintenance specialist for repair assignments.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border dark:border-rose-800/40">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Role Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Account Type
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
                  role === 'tenant'
                    ? 'bg-[#635985] text-white shadow-sm dark:bg-[#635985]'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <Users size={15} /> Resident / Tenant
              </button>
              <button
                type="button"
                onClick={() => setRole('technician')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
                  role === 'technician'
                    ? 'bg-[#635985] text-white shadow-sm dark:bg-[#635985]'
                    : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <Wrench size={15} /> Technician
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="member-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
            <label htmlFor="member-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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

          {/* Property Selection Dropdown (For both Tenant and Technician) */}
          <div>
            <label htmlFor="member-property" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {role === 'tenant' ? 'Assigned Property / Building' : 'Assigned Property / Service Location'}
            </label>
            <div className="relative mt-1.5">
              <Building2 size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#92EEFF] z-10" />
              <select
                id="member-property"
                name="propertyId"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="auth-input !pl-11"
              >
                <option value="">Current Active Property</option>
                {propertiesData?.properties?.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name} ({prop.unitCount} units)
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {role === 'tenant'
                ? 'Select which property or building this resident will belong to.'
                : 'Select which property or building this technician will service.'}
            </p>
          </div>

          {/* Conditional: Unit Number for Tenant OR Specialization for Technician */}
          {role === 'tenant' ? (
            <div>
              <label htmlFor="member-unit" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Residents will see this pre-filled on their maintenance complaints.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="member-specialization" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Shown to managers when assigning technicians to maintenance tickets.
              </p>
            </div>
          )}

          {/* Temporary Password */}
          <div>
            <label htmlFor="member-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#635985] dark:text-[#92EEFF]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              At least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
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
