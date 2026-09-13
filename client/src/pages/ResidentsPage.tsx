import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building,
  CheckCircle2,
  Mail,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import { AddTeamMemberModal } from '../components/AddTeamMemberModal';
import { MetricCard } from '../components/MetricCard';
import { apiRequest } from '../lib/api';
import type { CurrentUser, TeamMember } from '../types/ticket';

export function ResidentsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['team'],
    queryFn: () => apiRequest<{ users: TeamMember[] }>('/api/team'),
    enabled: user?.role === 'manager',
  });

  if (user?.role !== 'manager') {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
        <ShieldAlert size={36} className="mx-auto text-rose-600" />
        <h2 className="mt-3 text-lg font-bold">Access Restricted</h2>
        <p className="mt-1 text-sm text-rose-700">
          The residents directory is only accessible to property managers.
        </p>
      </div>
    );
  }

  const allResidents = data?.users.filter((m) => m.role === 'tenant') ?? [];
  const filteredResidents = allResidents.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.unitNumber && r.unitNumber.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalResidents = allResidents.length;
  const uniqueUnits = new Set(allResidents.map((r) => r.unitNumber).filter(Boolean)).size;
  const activeCount = allResidents.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#18122B]">Residents Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage building tenants, unit allocations, and resident account access.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635985] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053]"
        >
          <Plus size={18} /> Onboard Resident
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Residents"
          value={String(totalResidents)}
          detail="Registered building tenants"
          icon={Users}
          tone="bg-blue-50 text-[#30AFFF]"
        />
        <MetricCard
          label="Occupied Units"
          value={String(uniqueUnits)}
          detail="Units with active tenants"
          icon={Building}
          tone="bg-purple-50 text-[#635985]"
        />
        <MetricCard
          label="Active Accounts"
          value={String(activeCount)}
          detail="Enabled portal logins"
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search residents by name, email, or unit..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#635985] focus:bg-white focus:ring-2 focus:ring-[#635985]/15"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="grid min-h-[250px] place-items-center text-slate-500">
            Loading resident directory…
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-rose-600">Failed to load residents.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs font-semibold text-[#635985] underline"
            >
              Try again
            </button>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="py-16 text-center">
            <UserCheck size={36} className="mx-auto text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-[#18122B]">No residents found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery
                ? 'No residents match your search phrase.'
                : 'Get started by onboarding your first apartment resident.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#635985] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#393053]"
              >
                <Plus size={16} /> Onboard Resident
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[750px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Resident</th>
                  <th className="px-4 py-3.5">Assigned Unit</th>
                  <th className="px-4 py-3.5">Email Address</th>
                  <th className="px-4 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResidents.map((resident) => {
                  const initials = resident.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={resident.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 place-items-center rounded-full bg-[#393053] text-xs font-bold text-white">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#18122B]">{resident.name}</p>
                            <p className="text-xs text-slate-400">Resident</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-[#18122B]">
                          {resident.unitNumber ? `Unit ${resident.unitNumber}` : 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{resident.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                            resident.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                              : 'bg-slate-100 text-slate-600 ring-slate-500/10'
                          }`}
                        >
                          {resident.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`mailto:${resident.email}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#635985] hover:text-[#393053]"
                        >
                          <Mail size={14} /> Email
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddTeamMemberModal
        isOpen={isAddOpen}
        initialRole="tenant"
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}
