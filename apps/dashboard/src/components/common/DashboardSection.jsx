export default function DashboardSection({
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}