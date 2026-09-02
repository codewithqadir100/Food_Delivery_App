import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/Forms/FormError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function RestaurantCreate({ categories }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    restaurant_category_id: '',
    description: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    logo: null,
    cover_image: null,
    is_open: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('restaurant.profile.store'));
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Create Restaurant
        </h2>
      }
    >
      <Head title="Create Restaurant" />

      <div className="py-12">
        <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
              <form
                onSubmit={submit}
                encType="multipart/form-data"
                className="space-y-6"
              >
                <div>
                  <InputLabel htmlFor="name" value="Restaurant Name *" />
                  <TextInput
                    id="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('name', e.target.value)}
                    required
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                  <InputLabel
                    htmlFor="restaurant_category_id"
                    value="Category *"
                  />
                  <select
                    id="restaurant_category_id"
                    value={data.restaurant_category_id}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) =>
                      setData('restaurant_category_id', e.target.value)
                    }
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <InputError
                    message={errors.restaurant_category_id}
                    className="mt-2"
                  />
                </div>

                <div>
                  <InputLabel htmlFor="description" value="Description" />
                  <textarea
                    id="description"
                    value={data.description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="4"
                    onChange={(e) => setData('description', e.target.value)}
                  />
                  <InputError message={errors.description} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="phone" value="Phone" />
                  <TextInput
                    id="phone"
                    value={data.phone}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('phone', e.target.value)}
                  />
                  <InputError message={errors.phone} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="address" value="Address *" />
                  <textarea
                    id="address"
                    value={data.address}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                    onChange={(e) => setData('address', e.target.value)}
                    required
                  />
                  <InputError message={errors.address} className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor="latitude" value="Latitude" />
                    <TextInput
                      id="latitude"
                      type="number"
                      step="any"
                      value={data.latitude}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('latitude', e.target.value)}
                    />
                    <InputError message={errors.latitude} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="longitude" value="Longitude" />
                    <TextInput
                      id="longitude"
                      type="number"
                      step="any"
                      value={data.longitude}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('longitude', e.target.value)}
                    />
                    <InputError message={errors.longitude} className="mt-2" />
                  </div>
                </div>

                <div>
                  <InputLabel htmlFor="logo" value="Logo" />
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full"
                    onChange={(e) => setData('logo', e.target.files[0])}
                  />
                  <InputError message={errors.logo} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="cover_image" value="Cover Image" />
                  <input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full"
                    onChange={(e) => setData('cover_image', e.target.files[0])}
                  />
                  <InputError message={errors.cover_image} className="mt-2" />
                </div>

                <div className="flex items-center">
                  <input
                    id="is_open"
                    type="checkbox"
                    checked={data.is_open}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    onChange={(e) => setData('is_open', e.target.checked)}
                  />
                  <label htmlFor="is_open" className="ml-2 text-sm text-gray-600">
                    Restaurant is currently open
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <PrimaryButton disabled={processing}>
                    Create Restaurant
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}