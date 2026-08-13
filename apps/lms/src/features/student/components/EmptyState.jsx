import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="card-premium flex flex-col items-center justify-center py-14 text-center">
      <div className="rounded-full bg-[#5d0f2d]/5 p-4">
        <Inbox className="h-8 w-8 text-[#8a164b]" />
      </div>
      <h3 className="mt-4 text-lg font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d]">
        {title}
      </h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-gray-500 font-medium">{message}</p>
      )}
    </div>
  );
}