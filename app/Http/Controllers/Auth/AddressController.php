<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/SetupAddress');
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $user = auth()->user();

        CustomerAddress::create([
            'customer_id' => $user->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'city_name' => $request->city_name,
            'area_name' => $request->area_name,
            'street_address' => $request->street_address,
            'is_primary' => true,
        ]);

        return redirect()->route('home');
    }

    public function skip(): RedirectResponse
    {
        return redirect()->route('home');
    }
}