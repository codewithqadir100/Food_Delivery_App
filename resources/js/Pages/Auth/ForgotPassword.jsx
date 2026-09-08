import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Common/Card';
import Button from '@/Components/Common/Button';
import TextInput from '@/Components/Forms/TextInput';
import Alert from '@/Components/Common/Alert';
import { Mail, ArrowRight } from 'lucide-react';

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Forgot Password" />

      <Card padding="lg" className="mb-6">
        <div className="space-y-6">
          {status && (
            <Alert
              type="success"
              message={status}
            />
          )}

          <div>
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">
              Reset Your Password
            </h2>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Enter your email address and we'll redirect you to create a new password
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <TextInput
              type="email"
              placeholder="your@email.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={processing}
              icon={ArrowRight}
            >
              Next
            </Button>
          </form>
        </div>
      </Card>

      <div className="text-center text-sm border-t border-[color:var(--color-border-light)] pt-4">
        <span className="text-[color:var(--color-text-secondary)]">Remember your password? </span>
        <Link
          href={route('login')}
          className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
        >
          Sign in
        </Link>
      </div>
    </AuthenticatedLayout>
  );
}