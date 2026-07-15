import { Layout, Image, BookOpen, Monitor, Info, Pencil } from 'lucide-react';

const contentSections = [
  {
    title: 'Homepage Banner',
    description: 'Manage the main hero banner, tagline, and call-to-action buttons displayed on the homepage.',
    icon: Monitor,
  },
  {
    title: 'About Section',
    description: 'Edit the organization\'s mission statement, vision, values, and team information.',
    icon: BookOpen,
  },
  {
    title: 'Programs',
    description: 'Manage internship programs, volunteer opportunities, and other initiatives listed on the site.',
    icon: Layout,
  },
  {
    title: 'Gallery',
    description: 'Upload and manage event photos, team images, and other media displayed in the gallery section.',
    icon: Image,
  },
];

export default function Content() {
  return (
    <div>
      {/* Topbar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Website Content</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your website sections</p>
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {contentSections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#56051a]/10 rounded-lg w-9 h-9 flex items-center justify-center">
                  <section.icon className="w-4.5 h-4.5 text-[#56051a]" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">{section.title}</h3>
              </div>
              <button className="text-sm text-[#56051a] hover:bg-[#56051a]/5 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-slate-500 leading-relaxed">{section.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-700 font-medium">Under Development</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Content management features are under active development. Full editing capabilities will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
