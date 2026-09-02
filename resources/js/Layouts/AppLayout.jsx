import { useState } from 'react';
import Navbar from '@/Components/Common/Navbar';
import Sidebar from '@/Components/Common/Sidebar';
import { Menu, X } from 'lucide-react';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Toggle Button (Floating) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="
          fixed bottom-6 right-6 md:hidden
          w-14 h-14
          rounded-full
          bg-[color:var(--color-primary-600)]
          text-white
          shadow-lg
          hover:bg-[color:var(--color-primary-700)]
          transition-all
          z-40
          flex items-center justify-center
        "
      >
        {sidebarOpen ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>
    </div>
  );
}