import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Filter,
  Mail,
  Plus,
  Search,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { AddTeamMemberModal } from '../components/AddTeamMemberModal';
import { MetricCard } from '../components/MetricCard';
import { apiRequest } from '../lib/api';
import type { CurrentUser, ManagedProperty, TeamMember, Ticket } from '../types/ticket';

export function TechniciansPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;

  // 1. Team roster
  const { data: teamData, isLoading: isTeamLoading, isError, refetch } = useQuery({
    queryKey: ['team'],
    queryFn: () => apiRequest<{ users: TeamMember[] }>('/api/team'),
    enabled: user?.role === 'manager',
  });

  // 2. Tickets to compute active workloads per technician
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => apiRequest<{ tickets: Ticket[] }>('/api/tickets?limit=50'),
    enabled: user?.role === 'manager',
  });

  // 3. Properties list for property filtering
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => apiRequest<{ properties: ManagedProperty[] }>('/api/property/all'),
    enabled: user?.role === 'manager',
  });

  if (user?.role !== 'manager') {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
        <ShieldAlert size={36} className="mx-auto text-rose-600" />
        <h2 className="mt-3 text-lg font-bold">Access Restricted</h2>
        <p className="mt-1 text-sm text-rose-700">
          The technicians roster is only accessible to property managers.
        </p>
      </div>
    );
  }

  const allTechnicians = teamData?.users.filter((m) => m.role === 'technician') ?? [];
  const tickets = ticketsData?.tickets ?? [];

  // Count active tickets assigned to each technician
  const activeTicketCount = (technicianId: string) =>
    tickets.filter(
      (t) =>
        ((typeof t.assignedTechnician === 'object' && t.assignedTechnician?._id === technicianId) ||
          t.assignedTechnician === technicianId) &&
        t.status !== 'resolved' &&
        t.status !== 'closed',
    ).length;

  const totalTechnicians = allTechnicians.length;
  const activeTechnicians = allTechnicians.filter((t) => t.isActive).length;
  const totalActiveAssignments = tickets.filter(
    (t) => Boolean(t.assignedTechnician) && t.status !== 'resolved' && t.status !== 'closed',
  ).length;

  const specializationsList = Array.from(
    new Set(allTechnicians.map((t) => t.specialization).filter(Boolean)),
  ) as string[];

  const filteredTechnicians = allTechnicians.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.specialization && t.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.propertyName && t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialization =
      !selectedSpecialization || t.specialization === selectedSpecialization;

    const matchesProperty =
      propertyFilter === 'all' ||
      t.propertyId === propertyFilter ||
      t.propertyName === propertyFilter;

    return matchesSearch && matchesSpecialization && matchesProperty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#18122B] dark:text-white">
            Technician Roster
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Maintenance specialists, trade skills, and live repair work order dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635985] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] dark:hover:bg-[#443C68]"
        >
          <Plus size={18} /> Add Technician
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Technicians"
          value={String(totalTechnicians)}
          detail="On-site service staff"
          icon={Wrench}
          tone="bg-purple-50 text-[#635985] dark:bg-purple-950/30 dark:text-[#92EEFF]"
        />
        <MetricCard
          label="Active on Duty"
          value={String(activeTechnicians)}
          detail="Available for dispatch"
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
        />
        <MetricCard
          label="Active Work Orders"
          value={String(totalActiveAssignments)}
          detail="Assigned tickets in progress"
          icon={Briefcase}
          tone="bg-blue-50 text-[#30AFFF] dark:bg-blue-950/30 dark:text-[#30AFFF]"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1E1735]">
        <div className="relative min-w-[240px] flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technicians by name, email, or skill..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-[#635985] focus:bg-white focus:ring-2 focus:ring-[#635985]/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        {propertiesData?.properties && propertiesData.properties.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#18122B] outline-none hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <option value="all">All Properties ({propertiesData.properties.length})</option>
              {propertiesData.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#18122B] outline-none hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <option value="">All Specializations</option>
            {specializationsList.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Technician Roster Cards */}
      {isTeamLoading ? (
        <div className="grid min-h-[250px] place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-[#1E1735] dark:text-slate-400">
          Loading technician roster…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#1E1735]">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Failed to load technicians.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-xs font-semibold text-[#635985] underline dark:text-[#92EEFF]"
          >
            Try again
          </button>
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center dark:border-white/10 dark:bg-[#1E1735]">
          <Wrench size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-[#18122B] dark:text-white">No technicians found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery || selectedSpecialization || propertyFilter !== 'all'
              ? 'No technicians match your search or filter.'
              : 'Add technicians to start assigning maintenance tickets.'}
          </p>
          {!searchQuery && !selectedSpecialization && propertyFilter === 'all' && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#635985] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#393053]"
            >
              <Plus size={16} /> Add Technician
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTechnicians.map((tech) => {
            const workload = activeTicketCount(tech.id);
            const initials = tech.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <article
                key={tech.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1E1735]"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-[#635985] font-bold text-white shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#18122B] leading-tight dark:text-white">{tech.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{tech.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                        tech.isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20'
                          : 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-white/10'
                      }`}
                    >
                      {tech.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-[#635985] dark:bg-purple-900/30 dark:text-purple-300">
                      <Wrench size={13} />
                      {tech.specialization || 'General Maintenance'}
                    </span>

                    {tech.propertyName && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#18122B] dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        <Building2 size={13} className="text-[#635985] dark:text-[#92EEFF]" />
                        {tech.propertyName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-white/10">
                  <div>
                    <span className="font-medium text-slate-400 dark:text-slate-400">Active Workload:</span>{' '}
                    <span
                      className={`font-bold ${
                        workload > 0 ? 'text-[#18122B] dark:text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {workload} {workload === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>

                  <a
                    href={`mailto:${tech.email}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#635985] hover:text-[#393053] dark:text-[#92EEFF] dark:hover:text-[#BBE1FA]"
                  >
                    <Mail size={13} /> Contact
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AddTeamMemberModal
        isOpen={isAddOpen}
        initialRole="technician"
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}
