import React from 'react';

export default function MetricCard({ title, value, icon: Icon, changeText, isPositive = true }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#8a164b] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
        {changeText && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {changeText}
          </span>
        )}
      </div>
    </div>
  );
}
