<?php

declare(strict_types=1);

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\StoreReviewReplyRequest;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews) {}

    public function index(Request $request): Response
    {
        $restaurant = Auth::user()->restaurant;

        abort_unless($restaurant, 404);

        $sort = $this->sort($request);
        $payload = $this->payload($sort, 1);

        return Inertia::render('Restaurant/Reviews', [
            'summary' => $payload['summary'],
            'reviews' => $payload['reviews'],
            'sort' => $sort,
            'has_more' => $payload['has_more'],
        ]);
    }

    public function reply(StoreReviewReplyRequest $request, Review $review): JsonResponse
    {
        $saved = $this->reviews->reply($review, $request->validated('reply'));
        $saved->load([
            'customer:id,name',
            'order:id,order_number',
        ]);
        $saved->loadCount('helpfuls');

        return response()->json([
            'success' => true,
            'message' => 'Reply saved.',
            'review' => $this->reviews->present($saved, true),
        ]);
    }

    public function feed(Request $request): JsonResponse
    {
        abort_unless(Auth::user()->restaurant, 404);

        $sort = $this->sort($request);
        $page = max(1, (int) $request->query('page', 1));

        return response()->json($this->payload($sort, $page));
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $sort, int $page): array
    {
        $restaurant = Auth::user()->restaurant;
        $paginator = $this->reviews->list($restaurant, $sort, $page, null, true);

        return [
            'summary' => $this->reviews->summary($restaurant),
            'reviews' => $paginator->getCollection()
                ->map(fn ($review) => $this->reviews->present($review, true))
                ->values(),
            'sort' => $sort,
            'page' => $paginator->currentPage(),
            'has_more' => $paginator->hasMorePages(),
        ];
    }

    private function sort(Request $request): string
    {
        $sort = (string) $request->query('sort', 'newest');

        return in_array($sort, ReviewService::SORTS, true) ? $sort : 'newest';
    }
}
