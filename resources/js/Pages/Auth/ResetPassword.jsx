import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Common/Card';
import Button from '@/Components/Common/Button';
import TextInput from '@/Components/Forms/TextInput';
import PasswordInput from '@/Components/Forms/PasswordInput';
import Alert from '@/Components/Common/Alert';
import { Mail, Lock } from 'lucide-react';

export default function ResetPassword({ token, email }) {
  const { data, setData, post, processing, errors } = useForm({
    token: token,
    email: email,
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('password.store'), {
      onFinish: () => setData({ ...data, password: '', password_confirmation: '' }),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Reset Password" />

      <Card padding="lg" className="mb-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">
              Create New Password
            </h2>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <TextInput
              type="email"
              placeholder="your@email.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              disabled
            />

            <PasswordInput
              label="New Password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              error={errors.password}
              required
            />

            <PasswordInput
              label="Confirm Password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              error={errors.password_confirmation}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={processing}
              icon={Lock}
            >
              Reset Password
            </Button>
          </form>
        </div>
      </Card>
    </AuthenticatedLayout>
  );
}