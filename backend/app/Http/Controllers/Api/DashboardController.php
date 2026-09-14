<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\Route;
use App\Models\Reservation;
use App\Models\Agency;
use App\Models\Ticket;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\Baggage;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $filter = $request->query('filter', 'all');
        $startDate = null;
        $endDate = null;

        $now = Carbon::now();
        switch ($filter) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                break;
            case 'month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
            case 'year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;
            case 'custom':
                $start = $request->query('startDate');
                $end = $request->query('endDate');
                if ($start && $end) {
                    $startDate = Carbon::parse($start)->startOfDay();
                    $endDate = Carbon::parse($end)->endOfDay();
                }
                break;
        }

        // Apply date filters to queries
        $dateFilter = function ($query) use ($startDate, $endDate) {
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
        };

        // Date filter for specific date columns if needed
        $dateFilterPayment = function ($query) use ($startDate, $endDate) {
            if ($startDate && $endDate) {
                $query->whereBetween('payment_date', [$startDate, $endDate]);
            }
        };

        $totalReservations = Reservation::where($dateFilter)->count();
        $ticketsSold = Ticket::where($dateFilter)->count();
        $totalVehicles = Vehicle::count();
        $vehiclesInTransit = Vehicle::where('status', 'in_transit')->count();
        $totalDrivers = Driver::count();
        
        $baggageQuery = Baggage::query();
        if ($startDate && $endDate) {
            $baggageQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        $totalBaggage = $baggageQuery->count();

        // Revenue
        $todayRevenue = Payment::whereIn('status', ['paid', 'success'])
            ->whereDate('created_at', Carbon::today())
            ->sum('amount');
            
        $monthRevenue = Payment::whereIn('status', ['paid', 'success'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');
            
        $yearRevenue = Payment::whereIn('status', ['paid', 'success'])
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');

        // Charts Data
        // 1. Reservations per month
        $reservationsByMonth = Reservation::whereYear('created_at', Carbon::now()->year)
            ->get()
            ->groupBy(function ($item) {
                return (int) Carbon::parse($item->created_at)->format('m');
            })
            ->map(function ($items, $month) {
                return [
                    'month' => (int) $month,
                    'count' => $items->count()
                ];
            })
            ->values();

        // 2. Revenue per month
        $revenueByMonth = Payment::whereIn('status', ['paid', 'success'])
            ->whereYear('created_at', Carbon::now()->year)
            ->get()
            ->groupBy(function ($item) {
                return (int) Carbon::parse($item->created_at)->format('m');
            })
            ->map(function ($items, $month) {
                return [
                    'month' => (int) $month,
                    'total' => (float) $items->sum('amount')
                ];
            })
            ->values();

        // 3. Vehicle occupancy (dummy calculation or actual if available)
        $vehicleOccupancy = [
            'labels' => ['Occupés', 'Libres'],
            'data' => [
                Vehicle::where('status', 'in_transit')->count(),
                Vehicle::where('status', 'available')->count(),
            ]
        ];

        // 4. Routes distribution
        $routesDistribution = Route::withCount('schedules')
            ->orderBy('schedules_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($route) {
                return [
                    'name' => $route->origin . ' → ' . $route->destination,
                    'count' => $route->schedules_count
                ];
            });

        // 5. Agencies Stats
        $agenciesStats = Agency::withCount('vehicles')
            ->take(5)
            ->get()
            ->map(function ($agency) {
                return [
                    'name' => $agency->name,
                    'count' => $agency->vehicles_count
                ];
            });

        $recentReservations = Reservation::with(['user', 'schedule.route'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_reservations' => $totalReservations,
            'tickets_sold' => $ticketsSold,
            'total_vehicles' => $totalVehicles,
            'vehicles_in_transit' => $vehiclesInTransit,
            'total_drivers' => $totalDrivers,
            'total_baggage' => $totalBaggage,
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'year_revenue' => $yearRevenue,
            
            'charts' => [
                'reservations_by_month' => $reservationsByMonth,
                'revenue_by_month' => $revenueByMonth,
                'vehicle_occupancy' => $vehicleOccupancy,
                'routes_distribution' => $routesDistribution,
                'agencies_stats' => $agenciesStats,
            ],
            
            'recent_reservations' => $recentReservations,
        ]);
    }
}
