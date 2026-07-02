import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-text-main">
      <Sidebar />

      <main className="min-h-screen md:ml-64 p-4 sm:p-6 lg:p-8">
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
            borderRadius: '14px',
            padding: '0.8rem 1rem',
            fontSize: '0.875rem',
            background: '#fffaf3',
            color: '#3d2b2b',
            border: '1px solid #dcc8b6',
            boxShadow: '0 18px 45px rgba(93,15,45,0.14)',
          },
          success: {
            iconTheme: {
              primary: '#d8a15f',
              secondary: '#5d0f2d',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}