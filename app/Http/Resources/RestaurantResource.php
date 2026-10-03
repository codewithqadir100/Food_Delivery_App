<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $additional = $this->additional ?? [];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'cover_image_url' => $this->cover_image_url,
            'phone' => $this->phone,
            'street_address' => $this->street_address,
            'is_open' => $this->is_open,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'service_radius_km' => $this->service_radius_km,
            'city_name' => $this->city_name,
            'area_name' => $this->area_name,
            'status' => $this->status,
            'category' => [
                'id' => $this->restaurantCategory?->id,
                'name' => $this->restaurantCategory?->name,
            ],
            'rating' => $this->averageRating(),
            'review_count' => $this->reviewCount(),
            'distance_km' => $this->distance_km,
            'delivery_charge' => $this->delivery_charge,
            'listing_availability' => $this->listing_availability ?? $this->listingAvailability(),
            'is_featured' => (bool) ($this->is_featured ?? $this->subscription?->plan?->isFeatured()),
            'is_wishlisted' => (bool) ($this->is_wishlisted ?? false),
        ];
    }
}
