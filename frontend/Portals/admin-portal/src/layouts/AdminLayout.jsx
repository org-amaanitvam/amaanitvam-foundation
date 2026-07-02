import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 lg:p-8">
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
