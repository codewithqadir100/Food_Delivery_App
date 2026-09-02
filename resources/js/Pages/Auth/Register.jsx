import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/Common/Button';
import TextInput from '@/Components/Forms/TextInput';
import FormLabel from '@/Components/Forms/FormLabel';
import FormError from '@/Components/Forms/FormError';
import Card from '@/Components/Common/Card';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    role: 'customer',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <GuestLayout>
      <Head title="Register" />

      <Card padding="lg" className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          {/* Name */}
          <div>
            <FormLabel htmlFor="name" required>
              Full Name
            </FormLabel>
            <TextInput
              id="name"
              type="text"
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={errors.name}
              icon={<User size={16} />}
              autoComplete="name"
            />
            {errors.name && <FormError message={errors.name} />}
          </div>

          {/* Email */}
          <div>
            <FormLabel htmlFor="email" required>
              Email Address
            </FormLabel>
            <TextInput
              id="email"
              type="email"
              placeholder="your@email.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            {errors.email && <FormError message={errors.email} />}
          </div>

          {/* Role */}
          <div>
            <FormLabel htmlFor="role" required>
              I want to
            </FormLabel>
            <select
              id="role"
              value={data.role}
              onChange={(e) => setData('role', e.target.value)}
              className={`
                w-full px-3 py-2 text-base border rounded-lg
                bg-[color:var(--color-bg-primary)]
                text-[color:var(--color-text-primary)]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  errors.role
                    ? 'border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]'
                    : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]'
                }
              `}
            >
              <option value="customer">Order delicious food</option>
              <option value="restaurant_owner">Sell my food</option>
            </select>
            {errors.role && <FormError message={errors.role} />}
          </div>

          {/* Password */}
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
                autoComplete="new-password"
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
            {errors.password && <FormError message={errors.password} />}
          </div>

          {/* Confirm Password */}
          <div>
            <FormLabel htmlFor="password_confirmation" required>
              Confirm Password
            </FormLabel>
            <div className="relative">
              <input
                id="password_confirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                placeholder="••••••••"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className={`
                  w-full px-3 py-2 pl-10 pr-10
                  text-base border rounded-lg
                  bg-[color:var(--color-bg-primary)]
                  text-[color:var(--color-text-primary)]
                  placeholder-[color:var(--color-text-muted)]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    errors.password_confirmation
                      ? 'border-[color:var(--color-danger-500)] focus:ring-[color:var(--color-danger-300)]'
                      : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-primary-300)]'
                  }
                `}
                autoComplete="new-password"
              />
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)]" />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
              >
                {showPasswordConfirmation ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password_confirmation && (
              <FormError message={errors.password_confirmation} />
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            loading={processing}
            icon={UserPlus}
          >
            Create Account
          </Button>
        </form>
      </Card>

      {/* Login Link */}
      <div className="text-center text-sm border-t border-[color:var(--color-border-light)] pt-4">
        <span className="text-[color:var(--color-text-secondary)]">Already have an account? </span>
        <Link
          href={route('login')}
          className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
        >
          Sign in
        </Link>
      </div>
    </GuestLayout>
  );
}