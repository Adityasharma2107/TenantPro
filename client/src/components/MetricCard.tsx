import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: string;
}

export function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#18122B]">{value}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
          <Icon size={21} />
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{detail}</p>
    </article>
  );
}
