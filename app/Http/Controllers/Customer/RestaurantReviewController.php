<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews) {}

    public function show(Request $request, Restaurant $restaurant): Response
    {
        abort_unless($restaurant->isOrderable(), 404);

        $sort = $this->sort($request);
        $payload = $this->payload($restaurant, $sort, 1);

        return Inertia::render('Customer/RestaurantReviews', [
            'restaurant' => [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'logo_url' => $restaurant->logo_url,
            ],
            'summary' => $payload['summary'],
            'reviews' => $payload['reviews'],
            'sort' => $sort,
            'has_more' => $payload['has_more'],
        ]);
    }

    public function feed(Request $request, Restaurant $restaurant): JsonResponse
    {
        abort_unless($restaurant->isOrderable(), 404);

        $sort = $this->sort($request);
        $page = max(1, (int) $request->query('page', 1));

        return response()->json($this->payload($restaurant, $sort, $page));
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Restaurant $restaurant, string $sort, int $page): array
    {
        $paginator = $this->reviews->list($restaurant, $sort, $page, Auth::user(), false, true);

        return [
            'summary' => $this->reviews->summary($restaurant),
            'reviews' => $paginator->getCollection()
                ->map(fn ($review) => $this->reviews->present($review, false, Auth::user()))
                ->values(),
            'sort' => $sort,
            'page' => $paginator->currentPage(),
            'has_more' => $paginator->hasMorePages(),
        ];
    }

    private function sort(Request $request): string
    {
        $sort = (string) $request->query('sort', 'top');

        return in_array($sort, ReviewService::SORTS, true) ? $sort : 'top';
    }
}
