import { useState } from 'react';
import {
  AlertCircle,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/marketing/Footer';
import { Navbar } from '../components/marketing/Navbar';

export function ContactPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Property Manager');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable dispatch and navigate to Thank You confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/thank-you');
    }, 900);
  };

  return (
    <div className="marketing-page min-h-screen bg-slate-50 text-[#18122B]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#635985]/20 bg-[#635985]/5 px-3.5 py-1 text-xs font-semibold text-[#635985]">
            <Sparkles size={14} className="text-[#30AFFF]" />
            <span>24/7 Operations & Inquiries</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-5xl">
            Get in touch with TenantPro
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Whether you manage a 50-unit community or a multi-building portfolio, our support engineers
            and leasing experts are here to help.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left: Contact Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-purple-50 text-[#635985]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18122B]">Office Headquarters</h3>
                  <p className="text-xs text-slate-500">Main Facility & Demo Hub</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-[#18122B]">
                100 Panorama Way<br />Austin, TX 78701<br />United States
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18122B]">Telephone & Hotline</h3>
                  <p className="text-xs text-slate-500">Toll-free direct line</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <a
                  href="tel:+15125550199"
                  className="block text-sm font-bold text-[#18122B] transition hover:text-[#635985]"
                >
                  (512) 555-0199
                </a>
                <p className="text-xs text-slate-500">Direct operations desk</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18122B]">Email Dispatch</h3>
                  <p className="text-xs text-slate-500">24/7 Digital ticketing inbox</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <a
                  href="mailto:support@tenantpro.com"
                  className="block text-sm font-bold text-[#18122B] transition hover:text-[#635985]"
                >
                  support@tenantpro.com
                </a>
                <p className="text-xs text-slate-500">Avg response under 15 minutes</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18122B]">Operating Hours</h3>
                  <p className="text-xs text-slate-500">Central Standard Time (CST)</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-xs text-slate-600">
                <p className="flex justify-between">
                  <span>Mon – Fri:</span>
                  <strong className="text-slate-900">8:00 AM – 6:00 PM</strong>
                </p>
                <p className="flex justify-between">
                  <span>Saturday:</span>
                  <strong className="text-slate-900">9:00 AM – 1:00 PM</strong>
                </p>
                <p className="flex justify-between">
                  <span>Sunday:</span>
                  <strong className="text-rose-600">Emergency Dispatch Only</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Interactive Contact Form */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm lg:col-span-2 sm:p-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#635985]">
              <MessageSquare size={16} />
              <span>Send a Message</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#18122B]">We'd love to hear from you</h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill in the details below and an operations specialist will reply promptly.
            </p>

            {errorMessage && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Your Primary Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  >
                    <option value="Property Manager">Property Manager / Landlord</option>
                    <option value="Resident">Resident / Tenant</option>
                    <option value="Technician">Technician / Contractor</option>
                    <option value="Commercial Owner">Commercial Property Owner</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Skyline Heights Onboarding"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our team help your residential community?"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-[#18122B] outline-none transition focus:border-[#635985] focus:bg-white focus:ring-4 focus:ring-[#635985]/10"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#635985] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#635985]/25 transition hover:bg-[#393053] hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending Message…
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
