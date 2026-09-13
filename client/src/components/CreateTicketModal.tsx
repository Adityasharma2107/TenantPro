import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { apiRequest, uploadImagesRequest } from '../lib/api';
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
      setSelectedFiles([]);
      setPreviews([]);
      if (onSuccess) onSuccess(data.ticket);
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Unable to create ticket.');
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const combined = [...selectedFiles, ...incoming].slice(0, 5);
    setSelectedFiles(combined);

    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const nextFiles = selectedFiles.filter((_, i) => i !== index);
    const nextPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(nextFiles);
    setPreviews(nextPreviews);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = new FormData(e.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const location = String(form.get('location') ?? '').trim();

    let uploadedUrls: string[] = [];
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        uploadedUrls = await uploadImagesRequest(selectedFiles);
      } catch (err) {
        setIsUploading(false);
        setError(err instanceof Error ? err.message : 'Failed to upload photo attachments.');
        return;
      }
      setIsUploading(false);
    }

    const payload: Record<string, unknown> = {
      title,
      description,
      category,
      location,
      imageUrls: uploadedUrls,
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
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

          {/* Photo Attachments */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Attach Photos (Optional, max 5)
            </label>
            <div className="mt-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                <ImagePlus size={16} className="text-[#635985]" />
                <span>Add photos of the repair</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative size-16 overflow-hidden rounded-xl border border-slate-200">
                      <img src={preview} alt="Upload preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-[#18122B]/75 text-white hover:bg-rose-600 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              disabled={mutation.isPending || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#635985] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] disabled:opacity-50"
            >
              {(mutation.isPending || isUploading) && <Loader2 size={16} className="animate-spin" />}
              {isUploading ? 'Uploading photos…' : mutation.isPending ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
