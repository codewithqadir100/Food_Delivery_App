<?php declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $admins = User::where('role', User::ROLE_ADMIN)
            ->where('is_super_admin', false)
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/VerifyAdmins', [
            'admins' => $admins,
        ]);
    }

    public function approve(User $admin): RedirectResponse
    {
        $admin->update(['status' => User::STATUS_APPROVED]);

        return back()->with('success', 'Admin approved successfully.');
    }

    public function reject(User $admin): RedirectResponse
    {
        $admin->update(['status' => User::STATUS_REJECTED]);

        return back()->with('success', 'Admin rejected.');
    }
}