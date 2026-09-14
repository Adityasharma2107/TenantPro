import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  ChevronDown,
  Clock,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../components/marketing/Footer';
import { Navbar } from '../components/marketing/Navbar';
import { ScrollToTop } from '../components/marketing/ScrollToTop';

export function LandingPage() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'manager' | 'tenant' | 'technician'>('manager');

  const faqs = [
    {
      question: 'How does TenantPro streamline apartment & commercial property maintenance?',
      answer:
        'TenantPro eliminates lost paper notes, scattered text messages, and slow email threads. Tenants snap photo reports from their phones, building managers review and dispatch in seconds, and technicians update ticket status in real time with timestamped audit logs.',
    },
    {
      question: 'Can tenants track the live progress of their work orders on mobile?',
      answer:
        'Yes! Residents access a dedicated mobile-friendly portal where they receive real-time updates as their issue moves from Open to In Progress and Resolved. They can exchange messages directly with assigned contractors without exchanging personal phone numbers.',
    },
    {
      question: 'How are emergency maintenance tickets handled?',
      answer:
        'When a tenant flags a ticket as Urgent (such as major water leaks, heating outages, or security concerns), the system applies prominent visual alerts, notifies managers instantly, and activates emergency dispatch guidelines.',
    },
    {
      question: 'Is tenant and building data secure and role-isolated?',
      answer:
        'TenantPro enforces strict role-based access control (RBAC) and database-level multi-tenant isolation. All requests are securely verified via encrypted HTTP-only JWT cookies, and passwords are protected with 12-round bcrypt hashing.',
    },
    {
      question: 'Can I test TenantPro before onboarding an entire residential building?',
      answer:
        'Absolutely. Our live interactive environment includes pre-seeded demonstration data for "Skyline Heights". You can explore the Manager, Resident, and Technician perspectives with 1-click test credentials right now without entering a credit card.',
    },
  ];

  const testimonials = [
    {
      name: 'Marcus Vance',
      role: 'Senior Property Director',
      property: 'Skyline Heights Residences (Austin, TX)',
      stars: 5,
      content:
        'TenantPro reduced our maintenance response turnaround from 4 days to under 6 hours. The real-time dispatch and timestamped photo logs eliminate tenant disputes entirely.',
      avatar: 'MV',
    },
    {
      name: 'Elena Rostova',
      role: 'Resident (Unit 4B)',
      property: 'Skyline Heights',
      stars: 5,
      content:
        'Filing an issue takes literally 30 seconds on my phone. Being able to see when the technician is dispatched and getting an instant resolution confirmation is a breath of fresh air.',
      avatar: 'ER',
    },
    {
      name: 'David Chen',
      role: 'Lead HVAC & Plumbing Contractor',
      property: 'Precision Maintenance Group',
      stars: 5,
      content:
        'The mobile technician queue is built right for on-site trades. I see the photo of the leak before I even step into the unit, grab the right parts, and close the job right from my phone.',
      avatar: 'DC',
    },
    {
      name: 'Sophia Martinez',
      role: 'Community Operations Manager',
      property: 'Vista Ridge Apartments',
      stars: 5,
      content:
        'The occupancy dashboard, automated audit trails, and technician leaderboard give our ownership team complete operational transparency.',
      avatar: 'SM',
    },
  ];

  const demoAccounts = [
    {
      role: 'Manager',
      email: 'manager@tenantpro.com',
      note: 'Full building control & dispatch',
      color: 'bg-[#635985]',
    },
    {
      role: 'Resident (Unit 4B)',
      email: 'tenant1@tenantpro.com',
      note: 'Photo reporting & live timeline',
      color: 'bg-[#30AFFF]',
    },
    {
      role: 'Plumber Technician',
      email: 'tech.plumbing@tenantpro.com',
      note: 'Mobile work queue & parts tracker',
      color: 'bg-emerald-600',
    },
  ];

  const handleQuickDemo = (email: string) => {
    navigate(`/login?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="marketing-page min-h-screen bg-white text-[#18122B] selection:bg-[#635985] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#635985]/20 bg-[#635985]/5 px-4 py-1.5 text-xs font-semibold text-[#635985]">
              <Sparkles size={14} className="text-[#30AFFF]" />
              <span>Next-Gen Property Operations Platform</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#18122B] sm:text-6xl sm:leading-[1.15]">
              Property maintenance,{' '}
              <span className="bg-gradient-to-r from-[#635985] via-[#393053] to-[#30AFFF] bg-clip-text text-transparent">
                resolved in real time.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Connect residents, property managers, and technicians on one unified canvas. Snap photo
              reports, auto-dispatch contractor rosters, and resolve work orders 4x faster.
            </p>

            {/* Main Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635985] px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-[#635985]/25 transition hover:bg-[#393053] hover:shadow-2xl sm:w-auto"
              >
                Launch Live Demo <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-base font-bold text-[#18122B] shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                Talk with Operations
              </Link>
            </div>

            {/* Quick Demo Login Pills */}
            <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Interactive Demo (Password: <span className="font-mono text-[#18122B]">StrongPass123</span>)
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickDemo(acc.email)}
                    className="flex flex-col items-start rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-[#635985]/30 hover:bg-[#635985]/5"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-[#18122B]">{acc.role}</span>
                      <span className={`size-2 rounded-full ${acc.color}`} />
                    </div>
                    <span className="mt-1 truncate font-mono text-[11px] text-slate-500">
                      {acc.email}
                    </span>
                    <span className="mt-1 text-[10px] font-medium text-[#635985]">
                      {acc.note} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Mockup Preview Graphic */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-slate-300/80 bg-slate-900 p-2 shadow-2xl shadow-slate-900/20 sm:p-4">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 pb-3">
                <span className="size-3 rounded-full bg-rose-500" />
                <span className="size-3 rounded-full bg-amber-500" />
                <span className="size-3 rounded-full bg-emerald-500" />
                <span className="ml-2 rounded-md bg-white/10 px-3 py-0.5 text-xs text-slate-400 font-mono">
                  https://tenant-pro-client.vercel.app/app/dashboard
                </span>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-[#18122B] p-6 text-white sm:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs font-semibold text-slate-400">Total Work Orders</p>
                    <p className="mt-1 text-2xl font-black text-white">48 Active</p>
                    <p className="mt-1 text-xs text-emerald-400">↑ 99.8% On-time resolution</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs font-semibold text-slate-400">Avg Turnaround</p>
                    <p className="mt-1 text-2xl font-black text-white">4.2 Hours</p>
                    <p className="mt-1 text-xs text-[#92EEFF]">Automated contractor dispatch</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs font-semibold text-slate-400">Building Occupancy</p>
                    <p className="mt-1 text-2xl font-black text-white">96%</p>
                    <p className="mt-1 text-xs text-slate-400">Skyline Heights • 48 Units</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#92EEFF]">
                      Live Real-Time Activity Feed
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      WebSocket Connected
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span>Unit 4B — Water pipe leak in bathroom</span>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-300">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span>Unit 7A — Balcony light circuit tripping</span>
                      <span className="rounded bg-[#30AFFF]/20 px-2 py-0.5 font-semibold text-[#92EEFF]">
                        Assigned (Electrician)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Main Lobby — Package locker sensor replaced</span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
                        Resolved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Backdrop Accents */}
            <div className="pointer-events-none absolute -bottom-10 -left-10 size-60 rounded-full bg-[#635985]/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-10 -right-10 size-60 rounded-full bg-[#30AFFF]/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics Bar */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            <div>
              <p className="text-3xl font-extrabold text-[#18122B] sm:text-4xl">99.8%</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resolution Compliance
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#18122B] sm:text-4xl">5,000+</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Units Supported
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#18122B] sm:text-4xl">&lt; 15 min</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average Dispatch Time
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#18122B] sm:text-4xl">4.9 ★</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resident Satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid & Interactive Role Switcher */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#635985]">
              Role-Tailored Workspaces
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-4xl">
              Purpose-built tools for every stakeholder
            </p>
            <p className="mt-4 text-base text-slate-600">
              One platform with three dedicated workspaces designed for effortless coordination.
            </p>

            {/* Role Tab Selector */}
            <div className="mt-8 inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
              {(['manager', 'tenant', 'technician'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleTab(role)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold capitalize transition-all ${
                    selectedRoleTab === role
                      ? 'bg-white text-[#18122B] shadow-sm'
                      : 'text-slate-600 hover:text-[#18122B]'
                  }`}
                >
                  For {role}s
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Role Feature Content */}
          <div className="mt-12">
            {selectedRoleTab === 'manager' && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#635985]/10 text-[#635985]">
                    <Activity size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Real-Time Dispatch Engine</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Assign incoming tickets to internal maintenance staff or external contractors with 1 click.
                    Monitor technician workloads, active tickets, and turnaround speeds.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <Building2 size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Property & Unit Directory</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Manage full residential rosters, track occupied vs. vacant units, update building rules,
                    and manage staff contact guidelines all from one centralized hub.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Audit Trails & Exports</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Every status change, technician assignment, and resolution timestamp is permanently logged.
                    Download CSV reports for owners, insurers, and compliance audits.
                  </p>
                </div>
              </div>
            )}

            {selectedRoleTab === 'tenant' && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-purple-50 text-purple-600">
                    <Camera size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">30-Second Photo Reporting</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Take a photo of the leaking sink or broken appliance directly on your phone, pick a category,
                    and submit instantly without phone tag or paperwork.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <Bell size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Live Status Timeline</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Watch tickets move in real time from Open to Assigned, In Progress, and Resolved. Get instant
                    confirmation the moment work begins.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Direct Contractor Chat</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Leave notes, coordinate entry timing, and clarify details directly on the ticket thread
                    without sharing private phone numbers.
                  </p>
                </div>
              </div>
            )}

            {selectedRoleTab === 'technician' && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Smartphone size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Mobile-First Job Queue</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    View active assignments ordered by urgency. Tap into unit location, issue photos, and tenant notes
                    right from your smartphone in the field.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-purple-50 text-purple-600">
                    <Wrench size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">1-Tap Status Updates</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Transition jobs from Assigned to In Progress and Resolved with a single button tap. Keeps
                    both managers and residents updated automatically.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <Clock size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#18122B]">Expense & Labor Tracking</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Log replacement part details and time spent directly on completed work orders for
                    accurate invoicing and operational records.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#635985]">
              Seamless Workflow
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-4xl">
              From issue report to sign-off in 3 steps
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <span className="text-4xl font-black text-[#635985]/20">01</span>
              <h3 className="mt-3 text-lg font-bold text-[#18122B]">Resident Submits with Photos</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                The resident chooses their unit, selects the problem category (plumbing, electrical, appliance),
                attaches clear photos, and submits in seconds.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <span className="text-4xl font-black text-[#635985]/20">02</span>
              <h3 className="mt-3 text-lg font-bold text-[#18122B]">Manager Assigns Technician</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                The property manager reviews the work order and assigns the best-suited technician with priority
                guidelines and target resolution windows.
              </p>
            </div>

            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <span className="text-4xl font-black text-[#635985]/20">03</span>
              <h3 className="mt-3 text-lg font-bold text-[#18122B]">Technician Resolves & Logs</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                The technician finishes the repair, adds closing comments or cost notes, and marks it resolved.
                All parties receive instantaneous digital verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Reviews / Testimonials Section (Item 10) */}
      <section id="reviews" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#635985]">
              Real Reviews
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-4xl">
              Trusted by leading property management teams
            </p>
            <p className="mt-4 text-base text-slate-600">
              See what community directors, residents, and technicians say about TenantPro.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-slate-700">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3.5 border-t border-slate-100 pt-6">
                  <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#635985] to-[#18122B] text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#18122B]">{t.name}</h4>
                    <p className="text-xs text-slate-500">
                      {t.role} • {t.property}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 FAQs Section (Item 6) */}
      <section id="faq" className="bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#635985]">
              Got Questions?
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-4xl">
              Frequently Asked Questions
            </p>
            <p className="mt-4 text-base text-slate-600">
              Everything you need to know about TenantPro workflows, security, and onboarding.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-[#18122B] hover:text-[#635985]"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#635985]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-[#635985]/20 bg-[#635985]/5 p-6 text-center">
            <p className="text-sm font-semibold text-[#18122B]">Have a specific operational question?</p>
            <p className="mt-1 text-xs text-slate-600">
              Our support engineers and property implementation team are available 24/7.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#635985] underline-offset-4 hover:underline"
            >
              Contact our team directly →
            </Link>
          </div>
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="bg-gradient-to-br from-[#18122B] via-[#393053] to-[#443C68] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Upgrade your building operations today.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Experience real-time ticket dispatching, instant photo verification, and transparent resident communications.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-[#18122B] shadow-xl hover:bg-slate-100 sm:w-auto"
            >
              Register Your Property <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-base font-bold text-white backdrop-blur hover:bg-white/20 sm:w-auto"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />

      {/* Sticky Mobile CTA Bar (Item 7) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="flex-1 rounded-xl bg-[#635985] py-2.5 text-center text-xs font-bold text-white shadow-md shadow-[#635985]/20"
          >
            Launch Live Demo
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-center text-xs font-bold text-[#18122B]"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
