import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function RestaurantShow() {
  const { restaurant, flash } = usePage().props;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Restaurant Profile
        </h2>
      }
    >
      <Head title={restaurant ? restaurant.name : 'No Restaurant'} />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {flash?.success && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
              {flash.success}
            </div>
          )}

          {restaurant ? (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="p-6">
                {restaurant.cover_image && (
                  <img
                    src={`/storage/${restaurant.cover_image}`}
                    alt={restaurant.name}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                  />
                )}

                <div className="flex items-start gap-4">
                  {restaurant.logo && (
                    <img
                      src={`/storage/${restaurant.logo}`}
                      alt={restaurant.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {restaurant.name}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          restaurant.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : restaurant.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {restaurant.status}
                      </span>
                      {restaurant.is_open ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          Open
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {restaurant.restaurant_category?.name}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Description
                    </h4>
                    <p className="mt-1 text-gray-900">
                      {restaurant.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Contact
                    </h4>
                    <p className="mt-1 text-gray-900">
                      {restaurant.phone || 'No phone provided.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Address
                    </h4>
                    <p className="mt-1 text-gray-900">{restaurant.address}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Location
                    </h4>
                    <p className="mt-1 text-gray-900">
                      {restaurant.latitude && restaurant.longitude
                        ? `${restaurant.latitude}, ${restaurant.longitude}`
                        : 'No coordinates set.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={route('restaurant.profile.edit', restaurant.id)}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Edit Restaurant
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  You have not created a restaurant yet.
                </p>
                <Link
                  href={route('restaurant.profile.create')}
                  className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Create Restaurant
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}