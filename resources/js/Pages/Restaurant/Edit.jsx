import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function RestaurantEdit({ restaurant, categories }) {
  const { data, setData, post, processing, errors } = useForm({
    _method: 'put',
    name: restaurant.name || '',
    restaurant_category_id: restaurant.restaurant_category_id || '',
    description: restaurant.description || '',
    phone: restaurant.phone || '',
    address: restaurant.address || '',
    latitude: restaurant.latitude || '',
    longitude: restaurant.longitude || '',
    logo: null,
    cover_image: null,
    is_open: restaurant.is_open || false,
  });

  const [logoPreview, setLogoPreview] = useState(
    restaurant.logo ? `/storage/${restaurant.logo}` : null
  );
  const [coverPreview, setCoverPreview] = useState(
    restaurant.cover_image ? `/storage/${restaurant.cover_image}` : null
  );

  const submit = (e) => {
    e.preventDefault();
    post(route('restaurant.profile.update', restaurant.id));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setData('logo', file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setData('cover_image', file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Edit Restaurant
        </h2>
      }
    >
      <Head title={`Edit ${restaurant.name}`} />

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
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="mb-2 h-20 w-20 rounded-full object-cover"
                    />
                  )}
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full"
                    onChange={handleLogoChange}
                  />
                  <InputError message={errors.logo} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="cover_image" value="Cover Image" />
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                    />
                  )}
                  <input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full"
                    onChange={handleCoverChange}
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
                    Update Restaurant
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