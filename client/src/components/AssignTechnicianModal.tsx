import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Wrench, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { TeamMember, Ticket } from '../types/ticket';

interface AssignTechnicianModalProps {
  isOpen: boolean;
  ticketId: string;
  currentTechnicianId?: string;
  onClose: () => void;
}

export function AssignTechnicianModal({
  isOpen,
  ticketId,
  currentTechnicianId,
  onClose,
}: AssignTechnicianModalProps) {
  const queryClient = useQueryClient();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(currentTechnicianId ?? '');
  const [error, setError] = useState('');

  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => apiRequest<{ users: TeamMember[] }>('/api/team'),
    enabled: isOpen,
  });

  const technicians = teamData?.users.filter((u) => u.role === 'technician' && u.isActive) ?? [];

  const mutation = useMutation({
    mutationFn: (technicianId: string) =>
      apiRequest<{ ticket: Ticket; message: string }>(`/api/tickets/${ticketId}/assignment`, {
        method: 'PATCH',
        body: JSON.stringify({ technicianId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to assign technician.');
    },
  });

  if (!isOpen) return null;

  const handleAssign = () => {
    if (!selectedTechnicianId) {
      setError('Please select a technician.');
      return;
    }
    mutation.mutate(selectedTechnicianId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="fixed inset-0 bg-[#18122B]/60 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1E1735]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-[#635985]/10 text-[#635985] dark:bg-white/10 dark:text-[#92EEFF]">
              <Wrench size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#18122B] dark:text-white">Assign Technician</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dispatch an on-site technician for this repair.</p>
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

        <div className="mt-5 space-y-4">
          {isTeamLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading technicians...</p>
          ) : technicians.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-700/40 dark:bg-amber-950/30">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No active technicians found.</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                Add technicians in the Technicians tab first before assigning tickets.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="select-technician" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Choose Technician
              </label>
              <select
                id="select-technician"
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="auth-input mt-1.5"
              >
                <option value="">-- Select a technician --</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                    {tech.specialization ? ` (${tech.specialization})` : ''}
                    {tech.propertyName ? ` • ${tech.propertyName}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={mutation.isPending || !selectedTechnicianId}
              onClick={handleAssign}
              className="rounded-xl bg-[#635985] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] dark:hover:bg-[#443C68] disabled:opacity-50"
            >
              {mutation.isPending ? 'Assigning…' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
