export default function MetricCard({
  title,
  value,
  icon: Icon,
  changeText,
  isPositive = true,
}) {
  return (
    <div className="card-premium flex items-start justify-between">
      <div>
        <p className="text-xs font-[family-name:var(--font-ui)] font-bold uppercase tracking-wider text-gray-400">
          {title}
        </p>
        <p className="mt-2 text-3xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
          {value}
        </p>
        {changeText && (
          <p
            className={`mt-1 text-xs font-semibold ${
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {changeText}
          </p>
        )}
      </div>
      {Icon && (
        <div className="rounded-xl bg-[#5d0f2d]/5 p-3">
          <Icon className="h-6 w-6 text-[#5d0f2d]" />
        </div>
      )}
    </div>
  );
}