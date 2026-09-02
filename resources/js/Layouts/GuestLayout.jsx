import { Link } from '@inertiajs/react';
import Logo from '@/assets/logo.png'

export default function GuestLayout({ children }) {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)] flex flex-col justify-center px-4 py-8">
      <div className="mx-auto bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border-light)] py-4">
          <Link href="/">
            <img src={Logo} className='h-14' alt="" />
          </Link>
      </div>

      {/* Centered Content - No Extra Layout Wrapper */}
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>

      {/* Footer - Simple */}
      <div className="text-center mt-8">
        <p className="text-xs text-[color:var(--color-text-muted)]">
          © 2024 FoodHub
        </p>
      </div>
    </div>
  );
}