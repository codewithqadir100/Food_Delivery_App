<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function create(): Response
    {
        $user = auth()->user();

        return Inertia::render('Customer/Addresses', [
            'address' => $user->primaryAddress,
        ]);
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $user = auth()->user();

        DB::transaction(function () use ($user, $request) {
            $address = CustomerAddress::where('customer_id', $user->id)
                ->where('is_primary', true)
                ->lockForUpdate()
                ->first();

            $data = [
                'latitude' => $request->validated('latitude'),
                'longitude' => $request->validated('longitude'),
                'city_name' => $request->validated('city_name'),
                'area_name' => $request->validated('area_name'),
                'street_address' => $request->validated('street_address'),
                'is_primary' => true,
            ];

            if ($address) {
                $address->update($data);
                return;
            }

            CustomerAddress::create([
                'customer_id' => $user->id,
                ...$data,
            ]);
        });

        return back()->with('success', 'Restaurant information updated successfully.');
    }

    public function skip(): RedirectResponse
    {
        return redirect()->route('home');
    }
}