import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Home,
  Mail,
  MapPin,
  PhoneCall,
  Shield,
  Trash2,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { apiRequest } from '../lib/api';
import type { CurrentUser, PropertyData } from '../types/ticket';

export function PropertyPage() {
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const { data: session } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiRequest<{ user: CurrentUser }>('/api/auth/me'),
  });
  const user = session?.user;
  const isManager = user?.role === 'manager';

  const {
    data: propertyData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['property'],
    queryFn: () => apiRequest<PropertyData>('/api/property'),
  });

  const property = propertyData?.property;
  const stats = propertyData?.stats;

  // Form states for Edit Property Modal
  const [name, setName] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [unitCount, setUnitCount] = useState<number | string>('');
  const [contactEmail, setContactEmail] = useState('');

  const openEditModal = () => {
    if (!property) return;
    setName(property.name);
    setLine1(property.address.line1);
    setCity(property.address.city);
    setState(property.address.state);
    setPostalCode(property.address.postalCode);
    setUnitCount(property.unitCount);
    setContactEmail(property.contactEmail || '');
    setEditError('');
    setEditSuccess('');
    setIsEditOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      address: { line1: string; city: string; state: string; postalCode: string };
      unitCount: number;
      contactEmail: string;
    }) =>
      apiRequest<{ message: string; property: any }>('/api/property', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property'] });
      setEditSuccess('Property details updated successfully!');
      setTimeout(() => {
        setIsEditOpen(false);
        setEditSuccess('');
      }, 1200);
    },
    onError: (err: any) => {
      setEditError(err.message || 'Failed to update property details.');
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    updateMutation.mutate({
      name,
      address: { line1, city, state, postalCode },
      unitCount: Number(unitCount),
      contactEmail,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
        <AlertTriangle size={36} className="mx-auto text-rose-600" />
        <h2 className="mt-3 text-lg font-bold">Unable to load property details</h2>
        <p className="mt-1 text-sm text-rose-700">Please verify your server connection and try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Property Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#18122B] via-[#393053] to-[#443C68] p-6 text-white shadow-xl lg:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md">
              <Building2 size={14} className="text-[#92EEFF]" />
              <span>Property Management Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              {property.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-[#92EEFF]" />
                {property.address.line1}, {property.address.city}, {property.address.state}{' '}
                {property.address.postalCode}
              </span>
              {property.contactEmail && (
                <a
                  href={`mailto:${property.contactEmail}`}
                  className="flex items-center gap-1.5 text-white/90 underline-offset-4 hover:underline"
                >
                  <Mail size={15} className="text-[#92EEFF]" />
                  {property.contactEmail}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {property.contactEmail && (
              <a
                href={`mailto:${property.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <Mail size={16} /> Contact Office
              </a>
            )}

            {isManager && (
              <button
                onClick={openEditModal}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#18122B] shadow-md transition-all hover:bg-slate-100"
              >
                <Edit3 size={16} /> Edit Property
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#635985]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-72 rounded-full bg-[#30AFFF]/15 blur-3xl" />
      </div>

      {/* Operational Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Units"
          value={stats?.totalUnits ?? property.unitCount}
          detail="Maximum residential capacity"
          icon={Home}
          tone="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Occupancy Rate"
          value={`${stats?.occupancyRate ?? 0}%`}
          detail={`${stats?.occupiedUnits ?? 0} occupied • ${stats?.vacantUnits ?? 0} vacant`}
          icon={Users}
          tone="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Maintenance Staff"
          value={stats?.technicianCount ?? 0}
          detail="Active technicians assigned"
          icon={Wrench}
          tone="bg-purple-50 text-[#635985]"
        />
        <MetricCard
          label="Active Work Orders"
          value={stats?.activeTicketsCount ?? 0}
          detail="In-progress or open issues"
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Occupancy Progress & Building Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#18122B]">Occupancy & Unit Allocation</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Live resident distribution across registered apartments
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {stats?.occupancyRate ?? 0}% Occupied
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Occupied: {stats?.occupiedUnits ?? 0} units</span>
              <span>Vacant: {stats?.vacantUnits ?? 0} units</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 ring-1 ring-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#635985] to-[#30AFFF] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, stats?.occupancyRate ?? 0))}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Total Units</p>
              <p className="mt-1 text-lg font-bold text-[#18122B]">{stats?.totalUnits ?? property.unitCount}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
              <p className="text-xs font-medium text-emerald-700">Active Residents</p>
              <p className="mt-1 text-lg font-bold text-emerald-800">{stats?.occupiedUnits ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Available Units</p>
              <p className="mt-1 text-lg font-bold text-slate-700">{stats?.vacantUnits ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Manager / Office Contact Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#635985]" />
              <h3 className="text-base font-bold text-[#18122B]">Management Office</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Official property representation & leasing desk
            </p>

            <div className="mt-5 space-y-3.5 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Manager
                </p>
                <p className="mt-1 font-bold text-[#18122B]">
                  {property.manager?.name || 'Property Manager'}
                </p>
                <p className="text-xs text-slate-500">
                  {property.manager?.email || property.contactEmail || 'office@tenantpro.com'}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Office Hours:</span>
                  <span className="font-semibold text-slate-800">Mon - Fri: 8 AM - 6 PM</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Saturday:</span>
                  <span className="font-semibold text-slate-800">9 AM - 1 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sunday:</span>
                  <span className="font-semibold text-rose-600">Closed (Emergency Only)</span>
                </div>
              </div>
            </div>
          </div>

          <a
            href={`mailto:${property.contactEmail || property.manager?.email || ''}`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#635985] py-2.5 text-xs font-semibold text-white shadow hover:bg-[#393053]"
          >
            <Mail size={15} /> Send Direct Inquiry
          </a>
        </div>
      </div>

      {/* Building Guidelines & Essential Protocols */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#18122B]">Community Guidelines & Building Protocols</h2>
          <p className="text-xs text-slate-500">
            Essential operational procedures for all residents and on-site staff.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <PhoneCall size={20} />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#18122B]">24/7 Emergency Dispatch</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              For major water pipe leaks, gas odors, or power outages, file a ticket flagged as{' '}
              <span className="font-semibold text-rose-600">Urgent</span> for automated priority notification.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Clock size={20} />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#18122B]">Quiet Hours</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Quiet hours are observed strictly between <strong>10:00 PM and 7:00 AM</strong> daily. Please keep
              audio and hallway disturbances to a minimum.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Trash2 size={20} />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#18122B]">Waste & Valet Trash</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Trash collection takes place every <strong>Tuesday & Friday</strong>. Place tied trash containers
              outside unit doors between 7 PM and 9 PM.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Calendar size={20} />
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#18122B]">Packages & Deliveries</h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Carrier parcels are stored in the secure package room adjacent to the main lobby. Residents
              receive digital notification when logged.
            </p>
          </div>
        </div>
      </div>

      {/* Manager Edit Property Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18122B]/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-[#635985]/10 text-[#635985]">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#18122B]">Edit Property Details</h3>
                  <p className="text-xs text-slate-500">Update building information and unit capacity</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Property Name
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
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Total Unit Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Contact / Support Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="office@property.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#18122B] outline-none focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#635985] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053] disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
