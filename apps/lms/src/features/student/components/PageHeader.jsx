export default function PageHeader({ title, subtitle, action, image }) {
  if (!image) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 font-medium">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl text-white shadow-xl mb-6">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
      <div className="relative z-10 p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-heading)] font-extrabold text-rose-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-white/90 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
