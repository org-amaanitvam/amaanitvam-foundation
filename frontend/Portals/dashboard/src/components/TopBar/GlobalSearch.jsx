import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ClipboardList, Calendar, FolderKanban, Users, Megaphone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${query}`);
        setResults(data.results);
        setShowDropdown(true);
        setActiveIndex(-1);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Flatten results for keyboard navigation
  const getFlattenedResults = () => {
    if (!results) return [];
    const flat = [];
    if (results.tasks?.length) results.tasks.forEach(t => flat.push({ ...t, type: 'task', path: '/tasks', icon: ClipboardList }));
    if (results.meetings?.length) results.meetings.forEach(m => flat.push({ ...m, type: 'meeting', path: '/meetings', icon: Calendar }));
    if (results.projects?.length) results.projects.forEach(p => flat.push({ ...p, type: 'project', path: '/projects', icon: FolderKanban }));
    if (results.announcements?.length) results.announcements.forEach(a => flat.push({ ...a, type: 'announcement', path: '/announcements', icon: Megaphone }));
    if (results.members?.length) results.members.forEach(u => flat.push({ ...u, type: 'member', path: '/members', icon: Users }));
    return flat;
  };

  const flatResults = getFlattenedResults();

  // Handle Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showDropdown && flatResults.length > 0) {
        setActiveIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && flatResults.length > 0) {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && activeIndex >= 0 && activeIndex < flatResults.length) {
        handleSelect(flatResults[activeIndex].path);
      }
    }
  };

  const handleSelect = (path) => {
    navigate(path);
    setShowDropdown(false);
    setQuery('');
  };

  const hasResults = results && (
    results.tasks?.length > 0 ||
    results.meetings?.length > 0 ||
    results.projects?.length > 0 ||
    results.announcements?.length > 0 ||
    results.members?.length > 0
  );

  let currentIndex = -1;

  const renderSection = (items, title, Icon, path) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-3 last:mb-0">
        <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
        {items.map((item) => {
          currentIndex++;
          const isActive = currentIndex === activeIndex;
          return (
            <div
              key={item._id}
              onClick={() => handleSelect(path)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-xl transition-colors ${
                isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.title || item.name}</p>
                <p className="text-xs text-slate-500 truncate">{item.description || item.message || item.email || item.status || 'View details'}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks, meetings, projects..."
          className="w-full pl-10 pr-10 py-2 bg-slate-100/70 border-transparent focus:bg-white focus:border-[#56051a] focus:ring-1 focus:ring-[#56051a] rounded-xl text-sm transition-all"
        />
        {loading ? (
          <Loader2 className="absolute right-3 w-4 h-4 text-slate-400 animate-spin" />
        ) : query && (
          <button onClick={() => { setQuery(''); setResults(null); setShowDropdown(false); }} className="absolute right-3 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-[400px] flex flex-col">
          {loading && !results ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 text-[#56051a] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Searching...</p>
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-2 overflow-y-auto">
              {renderSection(results.tasks, 'Tasks', ClipboardList, '/tasks')}
              {renderSection(results.meetings, 'Meetings', Calendar, '/meetings')}
              {renderSection(results.projects, 'Projects', FolderKanban, '/projects')}
              {renderSection(results.announcements, 'Announcements', Megaphone, '/announcements')}
              {renderSection(results.members, 'Members', Users, '/members')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
