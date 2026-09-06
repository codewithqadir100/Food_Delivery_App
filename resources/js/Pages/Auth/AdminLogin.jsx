import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Common/Card';
import Button from '@/Components/Common/Button';
import TextInput from '@/Components/Forms/TextInput';
import PasswordInput from '@/Components/Forms/PasswordInput';
import Checkbox from '@/Components/Forms/Checkbox';
import Alert from '@/Components/Common/Alert';
import { Mail, LogIn } from 'lucide-react';

export default function AdminLogin({ status }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <AuthLayout>
      <Head title="Admin Login" />

      <Card padding="lg">
        <div className="space-y-6">
          {status && (
            <Alert
              type="success"
              message={status}
            />
          )}

          <div>
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-1">
              Admin Login
            </h2>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Access FoodHub admin dashboard
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <TextInput
              type="email"
              placeholder="admin@email.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <PasswordInput
              label="Password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={errors.password}
              required
            />

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
              <span className="text-[color:var(--color-text-secondary)]">Need an account? </span>
              <Link
                href={route('admin.register')}
                className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
              >
                Register now
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}