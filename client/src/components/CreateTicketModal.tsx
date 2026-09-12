import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { Ticket, TicketCategory, TicketPriority } from '../types/ticket';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (ticket: Ticket) => void;
}

const emergencyCategories: TicketCategory[] = ['plumbing', 'electrical', 'security'];

export function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<TicketCategory>('plumbing');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [error, setError] = useState('');

  const isEmergencyCategory = emergencyCategories.includes(category);

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest<{ ticket: Ticket; message: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setError('');
      if (onSuccess) onSuccess(data.ticket);
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Unable to create ticket.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = new FormData(e.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const location = String(form.get('location') ?? '').trim();

    const payload: Record<string, unknown> = {
      title,
      description,
      category,
      location,
    };

    if (isEmergencyCategory) {
      payload.priority = priority;
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

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#18122B]">Report an issue</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Submit a maintenance request for your residence.
            </p>
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
          <div>
            <label htmlFor="ticket-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Category
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="auth-input mt-1.5"
              required
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="security">Security</option>
              <option value="appliance">Appliance</option>
              <option value="internet">Internet / Wi-Fi</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
          </div>

          {isEmergencyCategory ? (
            <div>
              <label htmlFor="ticket-priority" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Priority
              </label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="auth-input mt-1.5"
                required
              >
                <option value="low">Low — Not urgent</option>
                <option value="medium">Medium — Normal repair</option>
                <option value="high">High — Disrupting daily routine</option>
                <option value="urgent">Urgent — Immediate hazard / water leak</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">
                You can specify priority for plumbing, electrical, and security concerns.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-purple-50/60 p-3 text-xs text-[#635985]">
              <strong>Priority note:</strong> A property manager will evaluate and set the priority
              level after reviewing this request.
            </div>
          )}

          <div>
            <label htmlFor="ticket-location" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Location / Unit
            </label>
            <input
              id="ticket-location"
              name="location"
              required
              placeholder="e.g. Unit 302, Master Bathroom"
              className="auth-input mt-1.5"
            />
          </div>

          <div>
            <label htmlFor="ticket-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Title
            </label>
            <input
              id="ticket-title"
              name="title"
              required
              minLength={5}
              maxLength={120}
              placeholder="e.g. Kitchen sink faucet leaking heavily"
              className="auth-input mt-1.5"
            />
          </div>

          <div>
            <label htmlFor="ticket-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Description
            </label>
            <textarea
              id="ticket-description"
              name="description"
              required
              minLength={10}
              maxLength={2000}
              rows={3}
              placeholder="Describe the issue in detail, when it started, and any symptoms..."
              className="auth-input mt-1.5 resize-none"
            />
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
              className="rounded-xl bg-[#635985] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] disabled:opacity-50"
            >
              {mutation.isPending ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
