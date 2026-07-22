export default function QuickActionButton({
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="
      flex
      items-center
      gap-3
      rounded-xl
      border
      border-slate-200
      bg-white
      px-5
      py-3
      font-medium
      text-slate-700
      shadow-sm
      hover:border-[#56051a]
      hover:text-[#56051a]
      hover:shadow-md
      transition-all
      "
    >
      <Icon size={18} />

      {label}
    </button>
  );
}