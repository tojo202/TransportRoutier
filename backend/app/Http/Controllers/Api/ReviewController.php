<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Driver;
use App\Models\Notification;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'driver', 'schedule.route']);

        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->has('schedule_id')) {
            $query->where('schedule_id', $request->schedule_id);
        }

        $reviews = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'schedule_id' => 'nullable|exists:schedules,id',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : ($request->user_id ?? 1);

        $review = Review::create([
            'user_id' => $userId,
            'driver_id' => $request->driver_id,
            'schedule_id' => $request->schedule_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load(['user', 'driver']);

        $driver = Driver::find($request->driver_id);
        if ($driver && $driver->user_id) {
            Notification::create([
                'user_id' => $driver->user_id,
                'title' => 'Nouvel avis reçu ' . $request->rating . '/5',
                'message' => ($user ? $user->name : 'Un voyageur') . ' a laissé un avis : "' . substr($request->comment ?? '', 0, 50) . '"',
                'type' => 'success',
                'is_read' => false
            ]);
        }

        return response()->json($review, 201);
    }

    public function driverStats($driverId)
    {
        $driver = Driver::with(['agency', 'reviews.user'])->findOrFail($driverId);
        $avgRating = round($driver->reviews()->avg('rating') ?: 5.0, 1);
        $count = $driver->reviews()->count();

        return response()->json([
            'driver' => $driver,
            'average_rating' => $avgRating,
            'reviews_count' => $count,
            'recent_reviews' => $driver->reviews()->with('user')->latest()->take(5)->get()
        ]);
    }
}
