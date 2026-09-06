import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Common/Card';
import Button from '@/Components/Common/Button';
import TextInput from '@/Components/Forms/TextInput';
import TextArea from '@/Components/Forms/TextArea';
import SelectInput from '@/Components/Forms/SelectInput';
import Checkbox from '@/Components/Forms/Checkbox';
import PasswordInput from '@/Components/Forms/PasswordInput';
import FormLabel from '@/Components/Forms/FormLabel';
import { Mail, Building2, MapPin, Phone, Store } from 'lucide-react';

export default function RestaurantRegister({ categories }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    password_confirmation: '',
    restaurant_name: '',
    restaurant_category_id: '',
    city: '',
    address: '',
    phone: '',
    description: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('restaurant.register'));
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <AuthLayout>
      <Head title="Restaurant Register" />

      <Card padding="lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-1">
              Become Our Partner
            </h2>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Register your restaurant and start selling
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                type="email"
                placeholder="restaurant@email.com"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
                icon={<Mail size={16} />}
                autoComplete="email"
                required
              />

              <TextInput
                type="text"
                placeholder="Your Restaurant Name"
                value={data.restaurant_name}
                onChange={(e) => setData('restaurant_name', e.target.value)}
                error={errors.restaurant_name}
                icon={<Building2 size={16} />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel required>Restaurant Category</FormLabel>
                <SelectInput
                  options={categoryOptions}
                  value={data.restaurant_category_id}
                  onChange={(e) => setData('restaurant_category_id', e.target.value)}
                  error={errors.restaurant_category_id}
                  placeholder="Select a category"
                />
              </div>

              <TextInput
                type="text"
                placeholder="e.g., Karachi"
                value={data.city}
                onChange={(e) => setData('city', e.target.value)}
                error={errors.city}
                icon={<MapPin size={16} />}
                required
              />
            </div>

            <TextInput
              type="text"
              placeholder="Full address"
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              error={errors.address}
              icon={<MapPin size={16} />}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                type="tel"
                placeholder="Phone number (optional)"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                error={errors.phone}
                icon={<Phone size={16} />}
              />

              <PasswordInput
                label="Password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                error={errors.password}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordInput
                label="Confirm Password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                error={errors.password_confirmation}
                required
              />

              <TextArea
                label="Description"
                placeholder="Tell us about your restaurant (optional)"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                error={errors.description}
                rows={3}
              />
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
              icon={Store}
            >
              Register Restaurant
            </Button>
          </form>

          <div className="text-center text-sm border-t border-[color:var(--color-border-light)] pt-4">
            <span className="text-[color:var(--color-text-secondary)]">Already registered? </span>
            <Link
              href={route('restaurant.login')}
              className="text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] font-medium"
            >
              Login here
            </Link>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}