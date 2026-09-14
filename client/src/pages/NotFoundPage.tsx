import { ArrowRight, Compass, Home, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/marketing/Footer';
import { Navbar } from '../components/marketing/Navbar';

export function NotFoundPage() {
  return (
    <div className="marketing-page min-h-screen bg-slate-50 text-[#18122B]">
      <Navbar />

      <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="relative">
          <div className="grid size-28 place-items-center rounded-3xl bg-[#635985]/10 text-[#635985] shadow-xl">
            <Compass size={56} className="animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <span className="absolute -top-2 -right-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow">
            404
          </span>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-[#18122B] sm:text-5xl">
          Unit or Page Not Found
        </h1>

        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
          The requested floor plan, unit record, or URL doesn't exist in this building or has been moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-[#18122B] shadow-sm hover:bg-slate-100"
          >
            <Home size={16} /> Return Home
          </Link>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#635985] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#635985]/25 hover:bg-[#393053]"
          >
            Go to Workspace <ArrowRight size={16} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            <LifeBuoy size={16} /> Contact Support
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
