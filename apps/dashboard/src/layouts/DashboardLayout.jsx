import Sidebar from "../components/navigation/Sidebar";
import TopBar from "../components/navigation/GlobalSearch"; // Or whatever your topbar file is named now!
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-[#3d2b2b]">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen p-6 lg:p-8">
        <TopBar />

        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            background: '#ffffff',
            color: '#3d2b2b',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}