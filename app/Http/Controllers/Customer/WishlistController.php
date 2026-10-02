<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\RestaurantListingService;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function __construct(
        private readonly WishlistService $wishlists,
        private readonly RestaurantListingService $listing,
    ) {}

    public function index(): Response
    {
        $user = auth()->user();

        $restaurants = $user->wishlistedRestaurants()
            ->with(['restaurantCategory', 'subscription.plan'])
            ->orderByPivot('created_at', 'desc')
            ->get();

        $presented = $this->wishlists->mark(
            $this->listing->withDelivery($restaurants, $user->primaryAddress),
            $user,
        );

        return Inertia::render('Customer/Wishlist', [
            'restaurants' => $presented
                ->map(fn (Restaurant $restaurant) => (new RestaurantResource($restaurant))->resolve())
                ->values(),
        ]);
    }

    public function store(Restaurant $restaurant): JsonResponse
    {
        if ($restaurant->listingAvailability() === Restaurant::LISTING_HIDDEN) {
            abort(404);
        }

        $user = auth()->user();
        $this->wishlists->add($user, $restaurant);

        return response()->json([
            'wishlisted' => true,
            'has_items' => true,
            'message' => 'Added to favourites',
        ]);
    }

    public function destroy(Restaurant $restaurant): JsonResponse
    {
        $user = auth()->user();
        $this->wishlists->remove($user, $restaurant);

        return response()->json([
            'wishlisted' => false,
            'has_items' => $this->wishlists->hasAny($user),
            'message' => 'Removed from favourites',
        ]);
    }
}
