<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CustomerAddress;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RestaurantListingService
{
    public function __construct(private readonly DeliveryCalculationService $delivery) {}

    public function paginate(Builder $query, ?CustomerAddress $address, int $perPage, int $page): LengthAwarePaginator
    {
        $this->constrain($query, $address);

        $paginator = $query->paginate($perPage, ['restaurants.*'], 'page', $page);
        $paginator->setCollection($this->decorate($paginator->getCollection(), $address));

        return $paginator;
    }

    public function take(Builder $query, ?CustomerAddress $address, int $limit): Collection
    {
        $this->constrain($query, $address);

        return $this->decorate($query->limit($limit)->get(['restaurants.*']), $address);
    }

    public function withDelivery(Collection $restaurants, ?CustomerAddress $address): Collection
    {
        return $this->decorate($restaurants, $address);
    }

    private function constrain(Builder $query, ?CustomerAddress $address): void
    {
        $now = now()->format('Y-m-d H:i:s');

        $query->join('subscriptions', 'subscriptions.restaurant_id', '=', 'restaurants.id')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->with(['restaurantCategory', 'subscription.plan'])
            ->orderByRaw(
                'CASE WHEN subscriptions.status = ? AND subscriptions.ends_at IS NOT NULL AND subscriptions.ends_at > ? AND restaurants.is_open = 1 THEN 0 ELSE 1 END',
                [Subscription::STATUS_ACTIVE, $now],
            )
            ->orderByRaw(
                'CASE WHEN plans.listing_tier = ? THEN 0 ELSE 1 END',
                [Plan::TIER_FEATURED],
            );

        if (! $this->hasCoordinates($address)) {
            $query->orderBy('restaurants.id');

            return;
        }

        $this->registerSqliteMath();

        $distance = '(6371 * 2 * ASIN(SQRT(
            POW(SIN(RADIANS(? - restaurants.latitude) / 2), 2)
            + COS(RADIANS(restaurants.latitude)) * COS(RADIANS(?))
            * POW(SIN(RADIANS(? - restaurants.longitude) / 2), 2)
        )))';
        $bindings = [
            (float) $address->latitude,
            (float) $address->latitude,
            (float) $address->longitude,
        ];

        $query->whereNotNull('restaurants.latitude')
            ->whereNotNull('restaurants.longitude')
            ->whereNotNull('restaurants.service_radius_km')
            ->whereRaw($distance.' <= restaurants.service_radius_km', $bindings)
            ->orderByRaw($distance, $bindings)
            ->orderBy('restaurants.id');
    }

    private function decorate(Collection $restaurants, ?CustomerAddress $address): Collection
    {
        $hasAddress = $this->hasCoordinates($address);
        $this->attachRatings($restaurants);

        return $restaurants->map(function (Restaurant $restaurant) use ($address, $hasAddress) {
            $restaurant->listing_availability = $restaurant->listingAvailability();
            $restaurant->is_featured = (bool) $restaurant->subscription?->plan?->isFeatured();

            if (! $hasAddress || $restaurant->latitude === null || $restaurant->longitude === null) {
                $restaurant->distance_km = null;
                $restaurant->delivery_charge = null;

                return $restaurant;
            }

            $distance = $this->delivery->calculateDistance(
                (float) $restaurant->latitude,
                (float) $restaurant->longitude,
                (float) $address->latitude,
                (float) $address->longitude,
            );

            $restaurant->distance_km = round($distance, 2);
            $restaurant->delivery_charge = $this->delivery->calculateDeliveryCharge($distance);

            return $restaurant;
        })->values();
    }

    private function attachRatings(Collection $restaurants): void
    {
        if ($restaurants->isEmpty()) {
            return;
        }

        $stats = Review::query()
            ->selectRaw('restaurant_id, COUNT(*) as review_count, AVG(rating) as rating_avg')
            ->whereIn('restaurant_id', $restaurants->modelKeys())
            ->groupBy('restaurant_id')
            ->get()
            ->keyBy('restaurant_id');

        foreach ($restaurants as $restaurant) {
            $row = $stats->get($restaurant->id);
            $restaurant->setAttribute('reviews_count', (int) ($row->review_count ?? 0));
            $restaurant->setAttribute('reviews_avg_rating', $row->rating_avg ?? null);
            $restaurant->syncOriginalAttribute('reviews_count');
            $restaurant->syncOriginalAttribute('reviews_avg_rating');
        }
    }

    private function hasCoordinates(?CustomerAddress $address): bool
    {
        return $address !== null
            && $address->latitude !== null
            && $address->longitude !== null;
    }

    private function registerSqliteMath(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            return;
        }

        $pdo = DB::connection()->getPdo();
        $pdo->sqliteCreateFunction('radians', static fn ($degrees) => deg2rad((float) $degrees), 1);
        $pdo->sqliteCreateFunction('sin', static fn ($value) => sin((float) $value), 1);
        $pdo->sqliteCreateFunction('cos', static fn ($value) => cos((float) $value), 1);
        $pdo->sqliteCreateFunction('asin', static fn ($value) => asin((float) $value), 1);
        $pdo->sqliteCreateFunction('sqrt', static fn ($value) => sqrt((float) $value), 1);
        $pdo->sqliteCreateFunction('pow', static fn ($base, $exponent) => pow((float) $base, (float) $exponent), 2);
    }
}
