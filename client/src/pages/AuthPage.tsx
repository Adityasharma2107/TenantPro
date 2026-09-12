import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { apiRequest } from '../lib/api';
import type { CurrentUser } from '../types/ticket';

interface AuthPageProps {
  register: boolean;
}

export function AuthPage({ register }: AuthPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest<{ user: CurrentUser; message: string }>(
        register ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(['current-user'], { user: data.user });
      navigate('/app/dashboard');
    },
    onError: (reason) => {
      setError(reason instanceof Error ? reason.message : 'Unable to continue. Please try again.');
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!register) {
      mutation.mutate({ email, password });
      return;
    }

    mutation.mutate({
      name: String(form.get('name') ?? '').trim(),
      email,
      password,
      property: {
        name: String(form.get('propertyName') ?? '').trim(),
        address: {
          line1: String(form.get('address') ?? '').trim(),
          city: String(form.get('city') ?? '').trim(),
          state: String(form.get('state') ?? '').trim(),
          postalCode: String(form.get('postalCode') ?? '').trim(),
        },
        unitCount: Number(form.get('unitCount')),
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-[#18122B]/10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Visual Brand Panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#18122B] via-[#393053] to-[#635985] p-12 lg:flex lg:flex-col">
          <div className="absolute -left-32 bottom-0 size-[26rem] rounded-full bg-[#30AFFF]/25 blur-3xl" />
          <div className="relative">
            <Brand />
            <div className="mt-28 max-w-md">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#92EEFF]">
                Property maintenance, simplified
              </p>
              <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-white">
                A clearer way to care for every home.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                TenantPro keeps residents, managers, and technicians aligned from the first report
                to final resolution.
              </p>
            </div>
          </div>
          <div className="relative mt-auto grid grid-cols-3 gap-3">
            {[
              ['28', 'Resolved this month'],
              ['82%', 'On-time repairs'],
              ['24', 'Homes connected'],
            ].map(([n, l]) => (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur" key={l}>
                <p className="text-2xl font-bold text-white">{n}</p>
                <p className="mt-1 text-xs text-slate-300">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form Panel */}
        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <div className="inline-flex items-center gap-2 text-[#393053]">
                <span className="grid size-9 place-items-center rounded-xl bg-[#635985] font-bold text-white">
                  T
                </span>
                <span className="font-bold">TenantPro</span>
              </div>
            </div>

            <p className="mt-12 text-sm font-bold uppercase tracking-[0.14em] text-[#635985]">
              {register ? 'Manager onboarding' : 'Welcome back'}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#18122B]">
              {register ? 'Set up your property workspace.' : 'Sign in to TenantPro.'}
            </h2>
            <p className="mt-3 text-slate-500">
              {register
                ? 'Create the first manager account for your property.'
                : 'Manage maintenance without the back-and-forth.'}
            </p>

            <form onSubmit={submit} className="mt-9 space-y-5">
              {register && (
                <>
                  <label className="block text-sm font-semibold text-slate-700">
                    Your full name
                    <input name="name" required className="auth-input" placeholder="Aditya Sharma" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Property name
                    <input
                      name="propertyName"
                      required
                      className="auth-input"
                      placeholder="Green View Apartments"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      City
                      <input name="city" required className="auth-input" placeholder="Delhi" />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      State
                      <input name="state" required className="auth-input" placeholder="Delhi" />
                    </label>
                  </div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Address
                    <input
                      name="address"
                      required
                      className="auth-input"
                      placeholder="123 Main Street"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Postal code
                      <input
                        name="postalCode"
                        required
                        className="auth-input"
                        placeholder="110001"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-slate-700">
                      Number of units
                      <input
                        name="unitCount"
                        required
                        min="1"
                        type="number"
                        className="auth-input"
                        placeholder="24"
                      />
                    </label>
                  </div>
                </>
              )}

              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <input
                  name="email"
                  required
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <div className="relative">
                  <input
                    name="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input pr-20"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#635985]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {register && (
                <p className="text-xs leading-5 text-slate-500">
                  Use at least 8 characters with uppercase, lowercase, and a number.
                </p>
              )}

              {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

              <button
                disabled={mutation.isPending}
                className="w-full rounded-xl bg-[#635985] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#635985]/25 hover:bg-[#393053] disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
              >
                {mutation.isPending
                  ? 'Please wait…'
                  : register
                  ? 'Create manager account'
                  : 'Sign in'}{' '}
                <ArrowUpRight className="ml-1 inline" size={16} />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              {register ? 'Already have an account?' : 'New to TenantPro?'}{' '}
              <Link
                className="font-bold text-[#635985]"
                to={register ? '/login' : '/register'}
              >
                {register ? 'Sign in' : 'Create a manager account'}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
