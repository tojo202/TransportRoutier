<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Notification::query();

        if ($user) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->latest()->take(20)->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : ($request->user_id ?? 1);

        $notification = Notification::create([
            'user_id' => $userId,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type ?? 'info',
            'is_read' => false
        ]);

        return response()->json($notification, 201);
    }

    public function update(Request $request, $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => $request->boolean('is_read', true)]);
        return response()->json($notification);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        $query = Notification::query();
        if ($user) {
            $query->where('user_id', $user->id);
        }
        $query->update(['is_read' => true]);
        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }
}
