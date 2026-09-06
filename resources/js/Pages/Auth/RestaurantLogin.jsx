import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Common/Button';
import TextInput from '@/Components/Forms/TextInput';
import Checkbox from '@/Components/Forms/Checkbox';
import FormLabel from '@/Components/Forms/FormLabel';
import Alert from '@/Components/Common/Alert';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function RestaurantLogin({ status }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('restaurant.login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <AuthLayout>
      <Head title="Restaurant Login" />

      {status && (
        <Alert
          type="success"
          message={status}
          className="mb-6"
        />
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-1">
            Restaurant Login
          </h2>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Manage your restaurant on FoodHub
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <FormLabel htmlFor="email" required>
              Email Address
            </FormLabel>
            <TextInput
              id="email"
              type="email"
              placeholder="restaurant@email.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
          </div>

          <div>
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className={`
                  w-full px-3 py-2 pl-10 pr-10
                  text-base border rounded-lg
                  bg-[color:var(--color-bg-primary)]
                  text-[color:var(--color-text-primary)]
                  placeholder-[color:var(--color-text-muted)]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    errors.password
                      ? 'border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]'
                      : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]'
                  }
                `}
                autoComplete="current-password"
              />
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-[color:var(--color-danger-600)] mt-1.5">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={data.remember}
              onChange={(e) => setData('remember', e.target.checked)}
            />
            <label htmlFor="remember" className="text-sm text-[color:var(--color-text-secondary)] cursor-pointer">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={processing}
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm">
          <Link
            href={route('password.request')}
            className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium block"
          >
            Forgot password?
          </Link>

          <div className="pt-3 border-t border-[color:var(--color-border-light)]">
            <span className="text-[color:var(--color-text-secondary)]">New restaurant? </span>
            <Link
              href={route('restaurant.register')}
              className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
            >
              Register now
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}