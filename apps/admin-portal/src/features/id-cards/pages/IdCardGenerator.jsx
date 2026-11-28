import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CreditCard,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  PlusCircle,
  Search,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../config/api.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import {
  downloadIdCardAsPdf,
  downloadIdCardAsPng,
  renderIdCardToCanvas,
} from '../utils/idCardRenderer.js';

const DEFAULT_POSITIONS = [
  'Managing Director',
  'Director',
  'Core Team Member',
  'Department Head',
  'Program Coordinator',
  'Volunteer',
  'Intern',
];

export default function IdCardGenerator() {
  const { userProfile } = useAuth();
  const isAdmin =
    userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  const previewCanvasRef = useRef(null);

  const [cards, setCards] = useState([]);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [nextIdNumber, setNextIdNumber] = useState('001');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [position, setPosition] = useState(DEFAULT_POSITIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState(null);

  const fetchIdCards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/id-cards');
      const fetchedCards = res.data?.cards || [];
      const fetchedPositions =
        res.data?.approvedPositions?.length > 0
          ? res.data.approvedPositions
          : DEFAULT_POSITIONS;

      setCards(fetchedCards);
      setPositions(fetchedPositions);
      if (res.data?.nextIdNumber) {
        setNextIdNumber(res.data.nextIdNumber);
      }
      setPosition((prev) =>
        fetchedPositions.includes(prev) ? prev : fetchedPositions[0],
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to load ID card records',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchIdCards();
    }
  }, [isAdmin]);

  // Live preview reflects either the newly created/selected card or current form input
  const previewPayload = useMemo(() => {
    if (activeCard && !name.trim()) {
      return {
        name: activeCard.name,
        position: activeCard.position,
        idNumber: activeCard.idNumber,
      };
    }
    return {
      name: name.trim() || 'Roshan Kapar',
      position: position || positions[0],
      idNumber: nextIdNumber,
    };
  }, [activeCard, name, position, positions, nextIdNumber]);

  useEffect(() => {
    if (previewCanvasRef.current) {
      renderIdCardToCanvas(previewCanvasRef.current, previewPayload, 2);
    }
  }, [previewPayload]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter the member’s full name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/id-cards', {
        name: trimmedName,
        position,
      });

      const created = res.data?.card;
      if (created) {
        setActiveCard(created);
        setCards((prev) => [created, ...prev]);
      }
      if (res.data?.nextIdNumber) {
        setNextIdNumber(res.data.nextIdNumber);
      }

      setName('');
      toast.success(
        `Generated ID-${created?.idNumber || nextIdNumber} for ${trimmedName}`,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to generate ID card',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.position?.toLowerCase().includes(q) ||
        item.idNumber?.toLowerCase().includes(q) ||
        `id-${item.idNumber}`.toLowerCase().includes(q),
    );
  }, [cards, searchQuery]);

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN');
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-lg mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Admin Access Only</h2>
        <p className="text-sm text-slate-500 mt-1">
          Only authorized administrators can generate or download member ID cards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-[#56051a]" />
          ID Card Generator
        </h1>
        <p className="text-slate-500 mt-1">
          Issue official Amaanitvam Foundation ID cards with sequential auto-assigned numbers and instant PNG/PDF export.
        </p>
      </div>

      {/* Form + Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Admin Input Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Generate New ID Card
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Only Name, Position, and the auto-generated ID Number change; template branding remains locked.
            </p>

            <form onSubmit={handleGenerate} className="space-y-5 mt-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Member Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    if (activeCard) setActiveCard(null);
                    setName(e.target.value);
                  }}
                  placeholder="e.g. Roshan Kapar"
                  maxLength={120}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Position (Approved List) *
                </label>
                <select
                  value={position}
                  onChange={(e) => {
                    if (activeCard) setActiveCard(null);
                    setPosition(e.target.value);
                  }}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]"
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  ID Number (Auto-Assigned Sequential)
                </label>
                <input
                  type="text"
                  value={nextIdNumber}
                  readOnly
                  disabled
                  className="w-full border border-slate-200 bg-slate-50 text-slate-600 font-mono font-bold rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Assigned automatically on submit (last issued + 1) to prevent duplicate IDs.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-[#56051a] hover:bg-[#6f0a24] disabled:opacity-60 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                {submitting
                  ? 'Assigning ID & Saving...'
                  : `Generate ID Card (#${nextIdNumber})`}
              </button>
            </form>
          </div>

          {activeCard && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Ready to Download
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  ID-{activeCard.idNumber}_{activeCard.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadIdCardAsPng(activeCard)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#56051a]" />
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => downloadIdCardAsPdf(activeCard)}
                  className="bg-[#56051a] hover:bg-[#6f0a24] text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Template Preview */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {activeCard ? 'Issued Card Preview' : 'Live Template Preview'}
            </span>
            <span className="font-mono text-xs font-semibold text-[#56051a] bg-[#56051a]/10 px-2.5 py-1 rounded-full">
              ID-{previewPayload.idNumber}
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-[#f8f5ef]">
            <canvas
              ref={previewCanvasRef}
              className="w-[260px] h-[416px] block"
            />
          </div>

          {activeCard && (
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => downloadIdCardAsPng(activeCard)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> PNG
              </button>
              <button
                type="button"
                onClick={() => downloadIdCardAsPdf(activeCard)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Issued ID Cards List + Search + Re-download */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Issued ID Cards ({cards.length})
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Search any member and re-download their PNG or PDF without generating a new ID.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID (001), position..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['ID Number', 'Member Name', 'Position', 'Issue Date', 'Re-Download'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 5 }).map((__, col) => (
                      <td key={col} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    {cards.length === 0
                      ? 'No ID cards have been generated yet. Use the form above to issue ID-001.'
                      : 'No matching ID cards found for your search.'}
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => (
                  <tr
                    key={card._id || card.idNumber}
                    onClick={() => {
                      setName('');
                      setActiveCard(card);
                    }}
                    className="hover:bg-slate-50/70 cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono text-sm font-bold text-[#56051a]">
                      {card.idNumber}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {card.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#56051a]/10 text-[#56051a]">
                        {card.position}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(card.issueDate || card.createdAt)}
                    </td>
                    <td
                      className="px-5 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => downloadIdCardAsPng(card)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#56051a]" />
                          PNG
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadIdCardAsPdf(card)}
                          className="bg-[#56051a]/10 hover:bg-[#56051a]/15 text-[#56051a] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}