<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Models\CustomerAddress;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Customer/AddressIndex', [
            'addresses' => $this->addressesFor($request),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Customer/Addresses', [
            'address' => null,
            'hasAddresses' => $request->user()->addresses()->exists(),
            'returnTo' => $this->returnTarget($request),
        ]);
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $user = $request->user();
            $isPrimary = ! CustomerAddress::query()
                ->where('customer_id', $user->id)
                ->lockForUpdate()
                ->exists();

            CustomerAddress::query()->create([
                'customer_id' => $user->id,
                'latitude' => $request->validated('latitude'),
                'longitude' => $request->validated('longitude'),
                'city_name' => $request->validated('city_name'),
                'area_name' => $request->validated('area_name'),
                'street_address' => $request->validated('street_address'),
                'is_primary' => $isPrimary,
            ]);
        });

        return $this->redirectAfterChange($request, 'Address saved.');
    }

    public function edit(Request $request, CustomerAddress $address): Response
    {
        $this->owned($request, $address);

        return Inertia::render('Customer/Addresses', [
            'address' => $address,
            'hasAddresses' => true,
            'returnTo' => $this->returnTarget($request),
        ]);
    }

    public function update(StoreAddressRequest $request, CustomerAddress $address): RedirectResponse
    {
        $this->owned($request, $address);

        $address->update($request->safe()->only([
            'latitude',
            'longitude',
            'city_name',
            'area_name',
            'street_address',
        ]));

        return $this->redirectAfterChange($request, 'Address updated.');
    }

    public function destroy(Request $request, CustomerAddress $address): RedirectResponse
    {
        $this->owned($request, $address);

        DB::transaction(function () use ($address): void {
            $customerId = $address->customer_id;
            $wasPrimary = $address->is_primary;

            $address->delete();

            if (! $wasPrimary) {
                return;
            }

            CustomerAddress::query()
                ->where('customer_id', $customerId)
                ->orderBy('created_at')
                ->orderBy('id')
                ->first()
                ?->update(['is_primary' => true]);
        });

        return redirect()
            ->route('customer.addresses.index')
            ->with('success', 'Address removed.');
    }

    public function skip(): RedirectResponse
    {
        return redirect()->route('home');
    }

    private function addressesFor(Request $request)
    {
        return $request->user()
            ->addresses()
            ->orderByDesc('is_primary')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get([
                'id',
                'street_address',
                'area_name',
                'city_name',
                'is_primary',
            ]);
    }

    private function owned(Request $request, CustomerAddress $address): void
    {
        abort_unless((int) $address->customer_id === (int) $request->user()->id, 404);
    }

    private function returnTarget(Request $request): ?array
    {
        if ($request->input('return_to') !== 'checkout') {
            return null;
        }

        $restaurant = Restaurant::query()->find($request->integer('restaurant_id'));

        if ($restaurant === null) {
            return null;
        }

        return [
            'type' => 'checkout',
            'restaurant_id' => $restaurant->id,
        ];
    }

    private function redirectAfterChange(Request $request, string $message): RedirectResponse
    {
        $returnTo = $this->returnTarget($request);

        if ($returnTo !== null) {
            return redirect()
                ->route('customer.checkout.show', $returnTo['restaurant_id'])
                ->with('success', $message);
        }

        return redirect()
            ->route('customer.addresses.index')
            ->with('success', $message);
    }
}
