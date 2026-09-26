<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        if ($user->isRejected()) {
            abort(403, 'Your account has been rejected.');
        }

        if (!$user->isSuperAdmin() && $user->isPending()) {
            return Inertia::render('Admin/PendingDashboard');
        }

        return Inertia::render('Admin/Dashboard', [
            'pendingRestaurantsCount' => Restaurant::query()
                ->where('status', Restaurant::STATUS_PENDING)
                ->count(),
            'pendingAdminsCount' => User::query()
                ->where('role', User::ROLE_ADMIN)
                ->where('is_super_admin', false)
                ->where('status', User::STATUS_PENDING)
                ->count(),
        ]);
    }
}
