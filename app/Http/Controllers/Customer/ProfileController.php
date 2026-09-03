<?php declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Customer/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function edit(): Response
    {
        return Inertia::render('Customer/ProfileEdit', [
            'user' => Auth::user(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        Auth::user()->update($validated);

        return redirect()->route('customer.profile.index')->with('success', 'Profile updated.');
    }

    public function wishlist(): Response
    {
        return Inertia::render('Customer/Wishlist', [
            'items' => [],
        ]);
    }

    public function history(): Response
    {
        return Inertia::render('Customer/History', [
            'orders' => [],
        ]);
    }

    public function addresses(): Response
    {
        return Inertia::render('Customer/Addresses', [
            'addresses' => [],
        ]);
    }
}