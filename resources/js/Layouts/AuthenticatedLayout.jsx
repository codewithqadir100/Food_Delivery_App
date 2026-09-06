import { Link } from '@inertiajs/react';
import Logo from '@/assets/logo.png'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)] flex flex-col">
      {/* Header with Logo */}
      <div className="mx-auto bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border-light)] py-4">
          <Link href="/">
            <img src={Logo} className='h-14' alt="" />
          </Link>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[color:var(--color-bg-primary)] rounded-xl shadow-md p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[color:var(--color-bg-primary)] border-t border-[color:var(--color-border-light)] py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            © 2026 FoodHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}