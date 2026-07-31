import { useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  Flag,
  AlertCircle,
  Users,
  CalendarDays
} from "lucide-react";

export default function FilterBar({ config, filters, setFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    const defaultFilters = {};
    config.forEach(c => {
      if (c.type === 'dateRange') {
        defaultFilters[c.name] = { start: '', end: '' };
      } else if (c.type === 'numberRange') {
        defaultFilters[c.name] = { min: '', max: '' };
      } else {
        defaultFilters[c.name] = c.defaultValue !== undefined ? c.defaultValue : (c.type === 'select' ? 'all' : '');
      }
    });
    setFilters(defaultFilters);
  };

  const updateFilter = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    config.forEach(c => {
      const val = filters[c.name];
      if (c.type === 'dateRange') {
        if (val?.start || val?.end) count++;
      } else if (c.type === 'numberRange') {
        if (val?.min !== '' || val?.max !== '') count++;
      } else if (val !== 'all' && val !== '' && val !== undefined) {
        count++;
      }
    });
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between lg:hidden mb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-slate-800">Advanced Filters</span>
          {activeCount > 0 && <span className="px-2 py-0.5 bg-[#56051a] text-white text-[10px] font-bold rounded-full">{activeCount}</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>



      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-xl bg-[#56051a]/10 flex items-center justify-center">
          <Filter className="w-6 h-6 text-[#56051a]" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Filter Tasks
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Quickly find tasks using the filters below.
          </p>
        </div>

      </div>


      <div className="border-t border-slate-200 my-6"></div>


      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${isOpen ? "grid" : "hidden lg:grid"
          }`}
      >
        {config.map((field) => (
          <div
            key={field.name}
            className="flex flex-col bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#56051a]/20 hover:shadow-lg transition-all duration-300 w-full"
          >
            <div className="flex items-center gap-2 mb-3">

  {field.name === "status" && (
    <Flag className="w-4 h-4 text-blue-600" />
  )}

  {field.name === "priority" && (
    <AlertCircle className="w-4 h-4 text-amber-500" />
  )}

  {field.name === "assignedTo" && (
    <Users className="w-4 h-4 text-emerald-600" />
  )}

  {field.name === "deadline" && (
    <CalendarDays className="w-4 h-4 text-rose-600" />
  )}

  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
    {field.label}
  </label>

</div>
            {field.type === 'select' && (
              <select
                value={filters[field.name] || 'all'}
                onChange={(e) => updateFilter(field.name, e.target.value)}
                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-700 shadow-sm hover:border-[#56051a] focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a] outline-none transition-all duration-300"
              >
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {field.type === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder || `Search by ${field.label.toLowerCase()}`}
                value={filters[field.name] || ''}
                onChange={(e) => updateFilter(field.name, e.target.value)}
                className="w-full lg:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
              />
            )}
            {field.type === 'dateRange' && (
              <div className="space-y-3">
                <input
                  type="date"
                  value={filters[field.name]?.start || ''}
                  onChange={(e) =>
                    updateFilter(field.name, {
                      ...filters[field.name],
                      start: e.target.value,
                    })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a] outline-none"
                />

                <input
                  type="date"
                  value={filters[field.name]?.end || ''}
                  onChange={(e) =>
                    updateFilter(field.name, {
                      ...filters[field.name],
                      end: e.target.value,
                    })
                  }
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a] outline-none"
                />
              </div>
            )}
            {field.type === 'numberRange' && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters[field.name]?.min !== undefined ? filters[field.name].min : ''}
                  onChange={(e) => updateFilter(field.name, { ...filters[field.name], min: e.target.value })}
                  className="w-full lg:w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters[field.name]?.max !== undefined ? filters[field.name].max : ''}
                  onChange={(e) => updateFilter(field.name, { ...filters[field.name], max: e.target.value })}
                  className="w-full lg:w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
                />
              </div>
            )}
          </div>
        ))}

        {activeCount > 0 && (
          <div className="flex flex-col justify-end mt-2 lg:mt-5">
            {/* <button onClick={handleClear} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> Clear Filters
            </button> */}


            <button
              onClick={handleClear}
              className="px-5 h-12 rounded-2xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </button>


          </div>
        )}
      </div>
    </div>
  );
}
