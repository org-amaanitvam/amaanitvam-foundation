import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-fade-in shadow-sm mb-6">
      <div className="flex items-center justify-between lg:hidden mb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-slate-800">Advanced Filters</span>
          {activeCount > 0 && <span className="px-2 py-0.5 bg-[#56051a] text-white text-[10px] font-bold rounded-full">{activeCount}</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <div className={`lg:flex items-center gap-4 flex-wrap ${isOpen ? 'flex flex-col lg:flex-row items-stretch' : 'hidden'}`}>
        {config.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 hidden lg:block">{field.label}</label>
            {field.type === 'select' && (
              <select
                value={filters[field.name] || 'all'}
                onChange={(e) => updateFilter(field.name, e.target.value)}
                className="w-full lg:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
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
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters[field.name]?.start || ''}
                  onChange={(e) => updateFilter(field.name, { ...filters[field.name], start: e.target.value })}
                  className="w-full lg:w-[130px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={filters[field.name]?.end || ''}
                  onChange={(e) => updateFilter(field.name, { ...filters[field.name], end: e.target.value })}
                  className="w-full lg:w-[130px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
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
                  className="w-full lg:w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-[#56051a] focus:border-[#56051a] outline-none"
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
            <button onClick={handleClear} className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
