import { Link } from '@inertiajs/react';
import Logo from '@/assets/logo.png';
import AuthBg from '@/assets/authpages-bg-banner.png';

export default function AuthLayout({ children }) {
  return (
    <>
    <div
        className="hidden lg:flex min-h-screen flex-col justify-center items-center px-4 py-8 bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{
          backgroundImage: `url(${AuthBg})`,
        }}
      >
      <div className="absolute inset-0 bg-black opacity-5 z-0" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex-shrink-0">
              <img src={Logo} alt="FoodHub" className="h-20 w-auto" />
            </Link>
          </div>


          <div
          >
          {children}
        </div>
        </div>

      </div>
    </div>

    <div className="flex lg:hidden min-h-screen flex-col justify-center items-center px-4 py-8 bg-[color:var(--color-bg-secondary)]">
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex-shrink-0">
              <img src={Logo} alt="FoodHub" className="h-14 w-auto" />
            </Link>
          </div>
 
          <div>{children}</div>
        </div>
      </div>

      </>
  );
}