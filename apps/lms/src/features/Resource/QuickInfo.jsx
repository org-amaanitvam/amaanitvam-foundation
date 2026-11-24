export const QuickInfo = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d8a15f]/10">
        <Icon className="h-4 w-4 text-[#b98243]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-text-muted">
          {label}
        </p>

        <p className="truncate text-sm font-semibold text-primary">
          {value}
        </p>
      </div>
    </div>
  );
};