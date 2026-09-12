import { useLocation } from 'react-router-dom';

export function PlaceholderPage() {
  const path = useLocation().pathname;
  const label = path.split('/').at(-1) ?? 'Page';

  const descriptions: Record<string, string> = {
    residents: 'Resident onboarding and unit assignment is planned for Day 8/9 team management workflows.',
    technicians: 'Technician rosters, skills, and workload management will expand in the upcoming milestones.',
    property: 'Building info, unit directories, and property configuration.',
    settings: 'Profile settings, password management, and notification preferences.',
  };

  return (
    <div className="grid min-h-[55vh] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="max-w-md">
        <p className="text-xl font-bold capitalize text-[#18122B]">{label} Portal</p>
        <p className="mt-2 text-sm text-slate-500">
          {descriptions[label] ?? 'This screen is planned for upcoming roadmap milestones.'}
        </p>
      </div>
    </div>
  );
}
