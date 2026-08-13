import React, { useState } from 'react';
import { X, Play, Video, Clock, Eye, Download, Link, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecordedSessionModal({ session, isOpen, onClose, onSaveRecording }) {
  const [recordingUrl, setRecordingUrl] = useState(session?.recordingUrl || '');
  const [isEditingUrl, setIsEditingUrl] = useState(!session?.recordingUrl);

  if (!isOpen || !session) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!recordingUrl.trim()) {
      toast.error('Please provide a valid recording URL.');
      return;
    }
    onSaveRecording?.(session._id || session.id, recordingUrl.trim());
    setIsEditingUrl(false);
    toast.success('Recorded session URL updated!');
  };

  const isEmbedVideo = recordingUrl.includes('youtube.com') || recordingUrl.includes('vimeo.com');
  const isDirectVideo = recordingUrl.endsWith('.mp4') || recordingUrl.endsWith('.webm');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5d0f2d] via-[#741339] to-[#8a164b] p-5 text-white flex items-center justify-between border-b border-[#8a164b]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/15 text-rose-100 border border-white/20">
                  {session.courseName || 'Recorded Class'}
                </span>
                <span className="text-xs text-[#d4af37] font-bold">{session.recordingDuration || '1h 45m'}</span>
              </div>
              <h3 className="font-extrabold text-base text-white tracking-tight">{session.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-gray-900 text-white">
          {session.recordingUrl && !isEditingUrl ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center">
                {isEmbedVideo ? (
                  <iframe
                    src={session.recordingUrl}
                    title={session.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isDirectVideo ? (
                  <video controls className="w-full h-full object-contain" poster="/video-thumbnail-placeholder.png">
                    <source src={session.recordingUrl} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <Video className="w-12 h-12 text-[#d4af37] mx-auto animate-pulse" />
                    <p className="text-xs text-gray-300 font-medium">Session recording hosted externally.</p>
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-[#3d091d] font-black text-xs rounded-xl shadow-lg hover:bg-[#b8952b] transition-all"
                    >
                      <span>Open Recording Stream</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Recording Metadata */}
              <div className="flex items-center justify-between p-4 bg-gray-800/80 rounded-2xl border border-gray-700 text-xs text-gray-300">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    Duration: {session.recordingDuration || '1h 45m'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    Student Views: {session.recordingViews || 24}
                  </span>
                </div>

                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="text-xs font-bold text-[#d4af37] hover:underline"
                >
                  Change Video URL
                </button>
              </div>
            </div>
          ) : (
            /* Input Form for Recording Link */
            <form onSubmit={handleSave} className="p-6 bg-gray-800/90 rounded-2xl border border-gray-700 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#d4af37]">
                  Session Cloud Recording Link (YouTube / Vimeo / MP4 URL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs font-bold text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex justify-end gap-2">
                {session.recordingUrl && (
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#d4af37] text-[#3d091d] text-xs font-black rounded-xl shadow-md hover:bg-[#b8952b]"
                >
                  Save Recording Link
                </button>
              </div>
            </form>
          )}

          {/* Description */}
          {session.description && (
            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-800 text-xs text-gray-300 leading-relaxed">
              <span className="font-extrabold text-white">Lecture Topics Covered: </span>
              {session.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
