import { useState } from 'react';
import Navbar from '@/Components/Common/Navbar';
import { Menu, X } from 'lucide-react';

export default function AppLayout({ children }) {

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex">

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}