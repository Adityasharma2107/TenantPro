import { ArrowRight, CheckCircle2, Home, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/marketing/Footer';
import { Navbar } from '../components/marketing/Navbar';

export function ThankYouPage() {
  return (
    <div className="marketing-page min-h-screen bg-slate-50 text-[#18122B]">
      <Navbar />

      <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        {/* Animated Checkmark Circle */}
        <div className="relative">
          <div className="grid size-24 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-[#635985] text-white">
            <Sparkles size={14} />
          </span>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-5xl">
          Thank you for contacting TenantPro!
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Your inquiry has been logged into our operational dispatch queue. One of our community operations
          specialists will review your notes and respond within 15 minutes.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-xs text-slate-600 max-w-md w-full">
          <p className="font-bold text-[#18122B] text-sm">Need immediate emergency support?</p>
          <p className="mt-1">
            Call our direct dispatch desk anytime at{' '}
            <a href="tel:+15125550199" className="font-bold text-[#635985] hover:underline">
              (512) 555-0199
            </a>{' '}
            or sign in to your operations workspace.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-[#18122B] shadow-sm hover:bg-slate-100 sm:w-auto"
          >
            <Home size={16} /> Return to Home
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635985] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#635985]/25 hover:bg-[#393053] sm:w-auto"
          >
            Sign In to Portal <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
