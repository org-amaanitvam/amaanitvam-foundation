import { TrendingUp } from "lucide-react";

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = "bg-[#56051a]",
}) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white`}
        >
          <Icon size={26} />
        </div>
      </div>

      {trend && (
        <div className="mt-5 flex items-center gap-2 text-green-600 text-sm font-semibold">
          <TrendingUp size={16} />
          {trend}
        </div>
      )}
    </div>
  );
}