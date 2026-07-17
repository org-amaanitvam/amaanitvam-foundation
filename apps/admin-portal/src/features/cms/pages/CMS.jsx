import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, LayoutTemplate, MessageSquare } from 'lucide-react';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

export default function CMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cms, setCms] = useState({
    homepage: { heroTitle: '', heroSubtitle: '', aboutSummary: '' },
    aboutUs: { mission: '', vision: '', history: '' }
  });

  useEffect(() => {
    fetchCMS();
  }, []);

  const fetchCMS = async () => {
    try {
      const res = await api.get('/cms');
      if (res.data.content) {
        setCms(res.data.content);
      }
    } catch (err) {
      toast.error('Failed to load CMS content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/cms', cms);
      toast.success('Website content updated successfully');
    } catch (err) {
      toast.error('Failed to update website content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Website CMS</h1>
          <p className="text-sm text-slate-500 mt-1">Manage public facing website content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#56051a] text-white rounded-xl font-medium hover:bg-[#7a1e3a] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Publishing...' : 'Publish Changes'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Homepage Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <LayoutTemplate className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Homepage Content</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hero Title</label>
              <input
                type="text"
                value={cms.homepage.heroTitle}
                onChange={(e) => setCms({...cms, homepage: {...cms.homepage, heroTitle: e.target.value}})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hero Subtitle</label>
              <input
                type="text"
                value={cms.homepage.heroSubtitle}
                onChange={(e) => setCms({...cms, homepage: {...cms.homepage, heroSubtitle: e.target.value}})}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">About Us Summary</label>
              <textarea
                value={cms.homepage.aboutSummary}
                onChange={(e) => setCms({...cms, homepage: {...cms.homepage, aboutSummary: e.target.value}})}
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-800">About Us Page</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mission Statement</label>
              <textarea
                value={cms.aboutUs.mission}
                onChange={(e) => setCms({...cms, aboutUs: {...cms.aboutUs, mission: e.target.value}})}
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Vision Statement</label>
              <textarea
                value={cms.aboutUs.vision}
                onChange={(e) => setCms({...cms, aboutUs: {...cms.aboutUs, vision: e.target.value}})}
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization History</label>
              <textarea
                value={cms.aboutUs.history}
                onChange={(e) => setCms({...cms, aboutUs: {...cms.aboutUs, history: e.target.value}})}
                rows={5}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
