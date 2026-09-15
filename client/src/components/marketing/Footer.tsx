import { Building2, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#18122B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/10 text-white backdrop-blur">
                <Building2 size={22} className="text-[#92EEFF]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">TenantPro</span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              The modern property maintenance operating system connecting residents, building managers,
              and maintenance technicians in real time.
            </p>

            <div className="space-y-2.5 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-[#92EEFF]" />
                <span>100 Panorama Way, Austin, TX 78701</span>
              </div>
              <div>
                <a
                  href="tel:+15125550199"
                  className="flex items-center gap-2.5 transition hover:text-white"
                >
                  <Phone size={16} className="text-[#92EEFF]" />
                  <span>(512) 555-0199</span>
                </a>
              </div>
              <div>
                <a
                  href="mailto:support@tenantpro.com"
                  className="flex items-center gap-2.5 transition hover:text-white"
                >
                  <Mail size={16} className="text-[#92EEFF]" />
                  <span>support@tenantpro.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="/#features" className="transition hover:text-white">
                  Core Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="transition hover:text-white">
                  Workflow Engine
                </a>
              </li>
              <li>
                <a href="/#reviews" className="transition hover:text-white">
                  Verified Reviews
                </a>
              </li>
              <li>
                <a href="/#faq" className="transition hover:text-white">
                  Frequently Asked
                </a>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Workspaces */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Workspaces</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Manager Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Resident Hub
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Technician Roster
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition hover:text-white">
                  Register Building
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Client Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Trust & Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/privacy" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy#security" className="transition hover:text-white">
                  Data Security & BCrypt
                </Link>
              </li>
              <li>
                <Link to="/privacy#cookies" className="transition hover:text-white">
                  Cookie Standards
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Adityasharma2107/TenantPro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition hover:text-white"
                >
                  <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Open Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and live status */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} TenantPro Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400" />
              API Systems Operational
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={14} className="text-[#92EEFF]" /> 256-bit Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
