import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Building2, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (property: any) => void;
}

export function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [unitCount, setUnitCount] = useState<number | string>('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: (body: {
      name: string;
      address: { line1: string; city: string; state: string; postalCode: string };
      unitCount: number;
      contactEmail?: string;
    }) =>
      apiRequest<{ message: string; property: any }>('/api/property', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (data) => {
      setSuccess('Property created successfully!');
      setError('');
      // Switch active property to new property
      try {
        await apiRequest('/api/property/switch', {
          method: 'POST',
          body: JSON.stringify({ propertyId: data.property.id }),
        });
      } catch {}

      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      queryClient.invalidateQueries({ queryKey: ['properties-list'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      setTimeout(() => {
        if (onSuccess) onSuccess(data.property);
        setSuccess('');
        onClose();
      }, 1000);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create property.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !line1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setError('Please fill in all required property address fields.');
      return;
    }

    if (!unitCount || Number(unitCount) < 1) {
      setError('Unit count must be at least 1.');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      address: {
        line1: line1.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      },
      unitCount: Number(unitCount),
      contactEmail: contactEmail.trim() || undefined,
    });
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
            <div className="grid size-9 place-items-center rounded-xl bg-[#635985]/10 text-[#635985] dark:bg-white/10 dark:text-[#92EEFF]">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18122B] dark:text-white">Add New Property</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register a building or multi-unit property to manage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 size={15} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Property Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunset Villa Apartments"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Street Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="e.g. 4500 Riverside Drive"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Postal Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="78704"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Count <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={unitCount}
                onChange={(e) => setUnitCount(e.target.value)}
                placeholder="30"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="office@property.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#635985] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] disabled:opacity-50"
            >
              {mutation.isPending ? 'Creating Property…' : 'Create & Switch to Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
