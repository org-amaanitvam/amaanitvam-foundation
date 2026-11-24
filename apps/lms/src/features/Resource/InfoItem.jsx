export const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 bg-white p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#56051a]/6">
        <Icon className="h-4 w-4 text-[#8a164b]" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-ui font-bold uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-primary">
          {value}
        </p>
      </div>
    </div>
  );
};