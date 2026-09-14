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

        $query = Message::with(['user', 'receiver'])
            ->where('schedule_id', $scheduleId);

        $user = $request->user();
        // Un utilisateur connecté ne voit que les messages broadcast + ceux qui le concernent
        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->whereNull('receiver_id')
                    ->orWhere('receiver_id', $user->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        $messages = $query->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'message' => 'required|string|max:1000',
            'receiver_id' => 'nullable|exists:users,id',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : ($request->user_id ?? 1);

        $message = Message::create([
            'schedule_id' => $request->schedule_id,
            'user_id' => $userId,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        $message->load(['user', 'receiver']);

        // Optional notification creation
        $schedule = Schedule::with(['driver.user', 'reservations.user'])->find($request->schedule_id);

        // Message privé : notifier le destinataire
        if ($request->receiver_id && (int) $request->receiver_id !== $userId) {
            Notification::create([
                'user_id' => $request->receiver_id,
                'title' => 'Nouveau message privé — trajet #' . $schedule?->id ?? '',
                'message' => ($user ? $user->name : 'Passager') . ': ' . substr($request->message, 0, 50),
                'type' => 'info',
                'is_read' => false
            ]);
        }

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
