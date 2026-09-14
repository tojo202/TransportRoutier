<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\BaggageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::get('/profile', [ProfileController::class, 'show']);
Route::put('/profile', [ProfileController::class, 'update']);

// CRUD Resource endpoints
Route::apiResource('agencies', AgencyController::class);
Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('drivers', DriverController::class);
Route::apiResource('routes', RouteController::class);
Route::apiResource('schedules', ScheduleController::class);

Route::apiResource('reservations', ReservationController::class);
Route::apiResource('tickets', TicketController::class);
Route::post('/tickets/scan', [TicketController::class, 'scanQr']);

// Paiements (ressource + simulation Mobile Money)
Route::get('/payments/methods', [PaymentController::class, 'methods']);
Route::post('/payments/mobile-money', [PaymentController::class, 'mobileMoney']);
Route::post('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
Route::apiResource('payments', PaymentController::class);
Route::apiResource('baggages', BaggageController::class);

Route::apiResource('notifications', NotificationController::class)->only(['index', 'store', 'update']);
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

// Chat & Reviews
Route::get('/messages', [ChatController::class, 'index']);
Route::post('/messages', [ChatController::class, 'store']);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/drivers/{id}/stats', [ReviewController::class, 'driverStats']);

Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/reports', [ReportController::class, 'index']);
