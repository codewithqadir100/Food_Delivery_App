import Navbar from '@/Components/Common/Navbar';

export default function AppLayout({ children, categories = [] }) {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
      <Navbar categories={categories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}