import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Mail,
  Menu,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: 'Features', href: isHome ? '#features' : '/#features' },
    { label: 'How It Works', href: isHome ? '#how-it-works' : '/#how-it-works' },
    { label: 'Reviews', href: isHome ? '#reviews' : '/#reviews' },
    { label: 'FAQ', href: isHome ? '#faq' : '/#faq' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Notification / Contact Bar */}
      <div className="bg-[#18122B] px-4 py-2 text-xs text-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2 rounded-full bg-[#30AFFF]" />
            <span className="hidden sm:inline">24/7 Property Maintenance Platform:</span>
            <span className="font-semibold text-[#92EEFF]">Multi-Family & Commercial Systems Active</span>
          </div>

          <div className="flex items-center gap-5 text-white/70">
            <a
              href="tel:+919826000199"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
              title="Call Leasing & Support Office"
            >
              <Phone size={13} className="text-[#92EEFF]" />
              <span className="hidden md:inline">+91 98260 00199</span>
            </a>
            <a
              href="mailto:support@tenantpro.com"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
              title="Send an email to TenantPro support"
            >
              <Mail size={13} className="text-[#92EEFF]" />
              <span className="hidden md:inline">support@tenantpro.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="TenantPro Home"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#18122B] to-[#635985] text-white shadow-md shadow-[#635985]/20">
              <Building2 size={22} className="text-[#92EEFF]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#18122B]">TenantPro</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#635985]">
                Property Operations
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#18122B]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#18122B] transition-colors hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#635985] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#635985]/20 transition-all hover:bg-[#393053] hover:shadow-lg"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#18122B]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 shadow-2xl transition-transform">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="grid size-8 place-items-center rounded-lg bg-[#18122B] text-white">
                  <Building2 size={18} className="text-[#92EEFF]" />
                </div>
                <span className="font-extrabold text-[#18122B]">TenantPro</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#18122B]"
                >
                  {item.label}
                  <ChevronRight size={16} className="text-slate-400" />
                </a>
              ))}
              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#18122B]"
              >
                Privacy Policy
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
            </nav>

            <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-bold text-[#18122B] shadow-sm hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-[#635985] py-3 text-sm font-bold text-white shadow-md shadow-[#635985]/20 hover:bg-[#393053]"
              >
                Get Started
              </Link>
            </div>

            <div className="mt-8 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <ShieldCheck size={16} /> Role-Isolated Portal
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Residents, Managers & Technicians operate in real time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
