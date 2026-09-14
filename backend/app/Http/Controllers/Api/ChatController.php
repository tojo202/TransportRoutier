<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $scheduleId = $request->query('schedule_id');
        if (!$scheduleId) {
            return response()->json(['error' => 'schedule_id required'], 400);
        }

        $messages = Message::with('user')
            ->where('schedule_id', $scheduleId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'message' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : ($request->user_id ?? 1);

        $message = Message::create([
            'schedule_id' => $request->schedule_id,
            'user_id' => $userId,
            'message' => $request->message,
        ]);

        $message->load('user');

        // Optional notification creation
        $schedule = Schedule::with(['driver.user', 'reservations.user'])->find($request->schedule_id);
        if ($schedule) {
            // Notify driver if sender is client, or notify clients if sender is driver
            if ($schedule->driver && $schedule->driver->user_id && $schedule->driver->user_id != $userId) {
                Notification::create([
                    'user_id' => $schedule->driver->user_id,
                    'title' => 'Nouveau message trajet #' . $schedule->id,
                    'message' => ($user ? $user->name : 'Passager') . ': ' . substr($request->message, 0, 50),
                    'type' => 'info',
                    'is_read' => false
                ]);
            }
        }

        return response()->json($message, 201);
    }
}
