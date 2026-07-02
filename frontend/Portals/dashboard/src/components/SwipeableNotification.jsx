import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SwipeableNotification({ notif, getIcon, handleMarkAsRead, handleDelete }) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const navigate = useNavigate();

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    if (diff < 0) { // Only allow swiping left
      setOffset(Math.max(diff, -100)); // Max swipe distance 100px
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (offset <= -60) {
      handleDelete(notif._id);
    } else {
      setOffset(0); // Snap back
    }
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e) => {
    startX.current = e.clientX;
    setIsSwiping(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping) return;
    const currentX = e.clientX;
    const diff = currentX - startX.current;
    if (diff < 0) {
      setOffset(Math.max(diff, -100));
    }
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (offset <= -60) {
      handleDelete(notif._id);
    } else {
      setOffset(0);
    }
  };
  
  const handleMouseLeave = () => {
    if (isSwiping) {
        setIsSwiping(false);
        setOffset(0);
    }
  }

  const handleClick = (e) => {
    if (offset < -10) return; // Ignore click if swiping
    if (!notif.isRead) handleMarkAsRead(notif._id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative overflow-hidden border-b border-slate-50">
      {/* Background Delete Action */}
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-rose-500 flex items-center justify-end pr-4 text-white z-0">
        <Trash2 className="w-5 h-5" />
      </div>

      {/* Foreground Notification */}
      <div
        className={`p-4 transition-colors flex gap-3 relative z-10 cursor-pointer select-none
          ${!notif.isRead ? 'bg-blue-50/90' : 'bg-white hover:bg-slate-50'}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="mt-0.5 shrink-0 pointer-events-none">
          {getIcon(notif.type)}
        </div>
        <div className="flex-1 min-w-0 pointer-events-none">
          <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
            {notif.title}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
          <div className="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
            <span>{new Date(notif.createdAt).toLocaleString()}</span>
            {!notif.isRead && (
              <span className="text-[#56051a] font-medium">New</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
