interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-xl bg-[#635985] font-bold text-white shadow-lg shadow-[#635985]/25">
        T
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-bold tracking-tight text-white">TenantPro</p>
          <p className="text-xs text-slate-400">Property operations</p>
        </div>
      )}
    </div>
  );
}
