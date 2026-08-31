<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@transport.com'],
            [
                'name' => 'Admin System',
                'password' => bcrypt('Admin123!'),
                'role' => 'admin',
            ]
        );

        $agent = User::firstOrCreate(
            ['email' => 'agent@transport.com'],
            [
                'name' => 'Jean Agent',
                'password' => bcrypt('Agent123!'),
                'role' => 'agent',
            ]
        );

        $driverUser = User::firstOrCreate(
            ['email' => 'driver@transport.com'],
            [
                'name' => 'Marc Chauffeur',
                'password' => bcrypt('Driver123!'),
                'role' => 'driver',
            ]
        );

        $client = User::firstOrCreate(
            ['email' => 'client@transport.com'],
            [
                'name' => 'Alice Client',
                'password' => bcrypt('Client123!'),
                'role' => 'client',
            ]
        );

        // Agencies
        $agency1 = \App\Models\Agency::firstOrCreate(['name' => 'Agence Centrale Gare'], [
            'address' => 'Gare Routière Principale, Avenue de la Liberté',
            'phone' => '+221 77 123 45 67',
            'manager_name' => 'M. Amadou Diallo'
        ]);

        $agency2 = \App\Models\Agency::firstOrCreate(['name' => 'Agence Littoral Express'], [
            'address' => 'Boulevard de la Marina, Port',
            'phone' => '+221 78 987 65 43',
            'manager_name' => 'Mme Fatou Sow'
        ]);

        // Vehicles
        $v1 = \App\Models\Vehicle::firstOrCreate(['plate_number' => 'DK-2024-AA'], [
            'brand' => 'Mercedes-Benz',
            'model' => 'Sprinter 519',
            'capacity' => 19,
            'status' => 'in_transit',
            'agency_id' => $agency1->id
        ]);

        $v2 = \App\Models\Vehicle::firstOrCreate(['plate_number' => 'DK-2024-BB'], [
            'brand' => 'Toyota',
            'model' => 'Coaster 30',
            'capacity' => 30,
            'status' => 'available',
            'agency_id' => $agency1->id
        ]);

        $v3 = \App\Models\Vehicle::firstOrCreate(['plate_number' => 'DK-2024-CC'], [
            'brand' => 'Scania',
            'model' => 'Interlink 50',
            'capacity' => 50,
            'status' => 'available',
            'agency_id' => $agency2->id
        ]);

        // Drivers
        $d1 = \App\Models\Driver::firstOrCreate(['license_number' => 'PERMIS-98765'], [
            'name' => 'Marc Chauffeur',
            'phone' => '+221 70 111 22 33',
            'experience_years' => 8,
            'agency_id' => $agency1->id
        ]);

        $d2 = \App\Models\Driver::firstOrCreate(['license_number' => 'PERMIS-12345'], [
            'name' => 'Ibrahima Ndiaye',
            'phone' => '+221 70 444 55 66',
            'experience_years' => 12,
            'agency_id' => $agency2->id
        ]);

        // Routes
        $r1 = \App\Models\Route::firstOrCreate([
            'origin' => 'Dakar',
            'destination' => 'Saint-Louis'
        ], [
            'distance_km' => 260.5,
            'estimated_duration_hours' => 4.0,
            'price' => 7500.00
        ]);

        $r2 = \App\Models\Route::firstOrCreate([
            'origin' => 'Dakar',
            'destination' => 'Thiès'
        ], [
            'distance_km' => 70.0,
            'estimated_duration_hours' => 1.2,
            'price' => 2500.00
        ]);

        $r3 = \App\Models\Route::firstOrCreate([
            'origin' => 'Dakar',
            'destination' => 'Ziguinchor'
        ], [
            'distance_km' => 450.0,
            'estimated_duration_hours' => 7.5,
            'price' => 15000.00
        ]);

        // Schedules
        $now = \Carbon\Carbon::now();
        $s1 = \App\Models\Schedule::firstOrCreate([
            'route_id' => $r1->id,
            'vehicle_id' => $v1->id,
            'departure_time' => $now->copy()->addHours(2),
        ], [
            'driver_id' => $d1->id,
            'arrival_time' => $now->copy()->addHours(6),
            'price' => 7500.00,
            'available_seats' => 15,
            'status' => 'in_progress'
        ]);

        $s2 = \App\Models\Schedule::firstOrCreate([
            'route_id' => $r2->id,
            'vehicle_id' => $v2->id,
            'departure_time' => $now->copy()->addDays(1)->setHour(8),
        ], [
            'driver_id' => $d2->id,
            'arrival_time' => $now->copy()->addDays(1)->setHour(9),
            'price' => 2500.00,
            'available_seats' => 28,
            'status' => 'scheduled'
        ]);

        // Reservations, Tickets, Payments
        for ($i = 1; $i <= 5; $i++) {
            $res = \App\Models\Reservation::create([
                'user_id' => $client->id,
                'schedule_id' => $s1->id,
                'seat_number' => $i,
                'status' => 'confirmed',
                'total_amount' => 7500.00,
                'created_at' => $now->copy()->subDays(rand(0, 15))
            ]);

            \App\Models\Ticket::create([
                'reservation_id' => $res->id,
                'ticket_number' => 'TKT-' . strtoupper(Str::random(8)),
                'qr_code' => 'QR-' . $res->id . '-' . time(),
                'status' => 'valid'
            ]);

            \App\Models\Payment::create([
                'reservation_id' => $res->id,
                'transaction_reference' => 'PAY-' . strtoupper(Str::random(10)),
                'amount' => 7500.00,
                'payment_method' => $i % 2 === 0 ? 'wave' : 'orange_money',
                'status' => 'success',
                'created_at' => $res->created_at
            ]);

            \App\Models\Baggage::create([
                'reservation_id' => $res->id,
                'weight_kg' => rand(5, 25),
                'tag_number' => 'BAG-' . sprintf('%04d', $i),
                'status' => 'loaded'
            ]);
        }

        // GPS Locations for multiple vehicles
        \App\Models\GpsLocation::create([
            'vehicle_id' => $v1->id,
            'latitude' => 14.7167,
            'longitude' => -17.4677,
            'speed' => 65.5,
            'recorded_at' => $now
        ]);

        \App\Models\GpsLocation::create([
            'vehicle_id' => $v2->id,
            'latitude' => 14.7800,
            'longitude' => -16.9200,
            'speed' => 70.0,
            'recorded_at' => $now->copy()->subMinutes(10)
        ]);

        \App\Models\GpsLocation::create([
            'vehicle_id' => $v3->id,
            'latitude' => 12.5833,
            'longitude' => -16.2719,
            'speed' => 0.0,
            'recorded_at' => $now->copy()->subMinutes(30)
        ]);

        // Extra Schedules
        $s3 = \App\Models\Schedule::firstOrCreate([
            'route_id' => $r3->id,
            'vehicle_id' => $v3->id,
            'departure_time' => $now->copy()->addDays(2)->setHour(6),
        ], [
            'driver_id' => $d1->id,
            'arrival_time' => $now->copy()->addDays(2)->setHour(14),
            'price' => 15000.00,
            'available_seats' => 45,
            'status' => 'scheduled'
        ]);

        // Extra Reservations, Tickets, Payments
        for ($i = 6; $i <= 12; $i++) {
            $res = \App\Models\Reservation::create([
                'user_id' => $client->id,
                'schedule_id' => $i % 2 === 0 ? $s1->id : $s2->id,
                'seat_number' => $i,
                'status' => $i % 3 === 0 ? 'pending' : 'confirmed',
                'total_amount' => $i % 2 === 0 ? 7500.00 : 2500.00,
                'created_at' => $now->copy()->subDays(rand(1, 30))
            ]);

            \App\Models\Ticket::create([
                'reservation_id' => $res->id,
                'ticket_number' => 'TKT-' . strtoupper(Str::random(8)),
                'qr_code' => 'QR-' . $res->id . '-' . time(),
                'status' => $res->status === 'confirmed' ? 'valid' : 'cancelled'
            ]);

            \App\Models\Payment::create([
                'reservation_id' => $res->id,
                'transaction_reference' => 'PAY-' . strtoupper(Str::random(10)),
                'amount' => $res->total_amount,
                'payment_method' => $i % 3 === 0 ? 'cash' : ($i % 2 === 0 ? 'wave' : 'orange_money'),
                'status' => $res->status === 'confirmed' ? 'success' : 'pending',
                'created_at' => $res->created_at
            ]);

            \App\Models\Baggage::create([
                'reservation_id' => $res->id,
                'weight_kg' => rand(8, 30),
                'tag_number' => 'BAG-' . sprintf('%04d', $i),
                'status' => $i % 2 === 0 ? 'loaded' : 'registered'
            ]);
        }

        // Notifications
        \App\Models\Notification::create([
            'user_id' => $admin->id,
            'title' => 'Nouveau départ imminant',
            'message' => 'Le car DK-2024-AA pour Saint-Louis est en route.',
            'type' => 'info',
            'is_read' => false
        ]);

        \App\Models\Notification::create([
            'user_id' => $admin->id,
            'title' => 'Réservation confirmée',
            'message' => 'Alice Client a réservé le siège N°6 sur la ligne Dakar - Thiès.',
            'type' => 'success',
            'is_read' => false
        ]);
    }
}
