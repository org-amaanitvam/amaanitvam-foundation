export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="card-premium flex flex-col items-center justify-center py-14 text-center">
      <div className="spinner" />
      <p className="mt-4 text-sm font-semibold text-gray-500">{label}</p>
    </div>
  );
}