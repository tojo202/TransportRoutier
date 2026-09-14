<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Agency;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Reservation;
use App\Models\Ticket;
use App\Models\Payment;
use App\Models\Baggage;
use App\Models\Notification;
use App\Models\Message;
use App\Models\Review;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Users for each of the 4 roles
        $admin = User::updateOrCreate(
            ['email' => 'admin@transport.com'],
            [
                'name' => 'Moussa Diop (Admin)',
                'password' => bcrypt('Admin123!'),
                'role' => 'admin',
            ]
        );

        $agent = User::updateOrCreate(
            ['email' => 'agent@transport.com'],
            [
                'name' => 'Awa Fall (Agent Guichet)',
                'password' => bcrypt('Agent123!'),
                'role' => 'agent',
            ]
        );

        $driverUser = User::updateOrCreate(
            ['email' => 'driver@transport.com'],
            [
                'name' => 'Marc Chauffeur (Conducteur)',
                'password' => bcrypt('Driver123!'),
                'role' => 'driver',
            ]
        );

        $driverUser2 = User::updateOrCreate(
            ['email' => 'ibrahima@transport.com'],
            [
                'name' => 'Ibrahima Ndiaye (Conducteur)',
                'password' => bcrypt('Driver123!'),
                'role' => 'driver',
            ]
        );

        $client = User::updateOrCreate(
            ['email' => 'client@transport.com'],
            [
                'name' => 'Alice Client (Passager)',
                'password' => bcrypt('Client123!'),
                'role' => 'client',
            ]
        );

        // 2. Agencies
        $agency1 = Agency::firstOrCreate(['name' => 'Agence Centrale Dakar'], [
            'address' => 'Gare Routière des Baux Maraîchers, Dakar',
            'phone' => '+221 33 800 11 22',
            'manager_name' => 'M. Amadou Diallo'
        ]);

        $agency2 = Agency::firstOrCreate(['name' => 'Agence Littoral Saint-Louis'], [
            'address' => 'Avenue Charles de Gaulle, Saint-Louis',
            'phone' => '+221 33 961 44 55',
            'manager_name' => 'Mme Fatou Sow'
        ]);

        $agency3 = Agency::firstOrCreate(['name' => 'Agence Sine-Saloum Kaolack'], [
            'address' => 'Boulevard Ndorong, Kaolack',
            'phone' => '+221 33 941 77 88',
            'manager_name' => 'M. Ousmane Kane'
        ]);

        // 3. Vehicles
        $v1 = Vehicle::firstOrCreate(['plate_number' => 'DK-2024-AA'], [
            'brand' => 'Mercedes-Benz',
            'model' => 'Sprinter VIP 19',
            'capacity' => 19,
            'status' => 'available',
            'agency_id' => $agency1->id
        ]);

        $v2 = Vehicle::firstOrCreate(['plate_number' => 'DK-2024-BB'], [
            'brand' => 'Toyota',
            'model' => 'Coaster Confort 30',
            'capacity' => 30,
            'status' => 'available',
            'agency_id' => $agency1->id
        ]);

        $v3 = Vehicle::firstOrCreate(['plate_number' => 'DK-2024-CC'], [
            'brand' => 'Scania',
            'model' => 'Interlink Grand Tourisme 50',
            'capacity' => 50,
            'status' => 'available',
            'agency_id' => $agency2->id
        ]);

        $v4 = Vehicle::firstOrCreate(['plate_number' => 'DK-2024-DD'], [
            'brand' => 'Peugeot',
            'model' => '5008 Covoiturage 6',
            'capacity' => 6,
            'status' => 'available',
            'agency_id' => $agency3->id
        ]);

        // 4. Drivers
        $d1 = Driver::updateOrCreate(['license_number' => 'PERMIS-98765'], [
            'name' => 'Marc Chauffeur',
            'phone' => '+221 77 111 22 33',
            'experience_years' => 9,
            'agency_id' => $agency1->id,
            'user_id' => $driverUser->id
        ]);

        $d2 = Driver::updateOrCreate(['license_number' => 'PERMIS-12345'], [
            'name' => 'Ibrahima Ndiaye',
            'phone' => '+221 78 444 55 66',
            'experience_years' => 14,
            'agency_id' => $agency2->id,
            'user_id' => $driverUser2->id
        ]);

        // 5. Routes
        $r1 = Route::firstOrCreate(['origin' => 'Dakar', 'destination' => 'Saint-Louis'], [
            'distance_km' => 260.5,
            'estimated_duration_hours' => 4.0,
            'price' => 7500.00
        ]);

        $r2 = Route::firstOrCreate(['origin' => 'Dakar', 'destination' => 'Thiès'], [
            'distance_km' => 70.0,
            'estimated_duration_hours' => 1.2,
            'price' => 2500.00
        ]);

        $r3 = Route::firstOrCreate(['origin' => 'Dakar', 'destination' => 'Touba'], [
            'distance_km' => 190.0,
            'estimated_duration_hours' => 2.5,
            'price' => 5000.00
        ]);

        $r4 = Route::firstOrCreate(['origin' => 'Dakar', 'destination' => 'Ziguinchor'], [
            'distance_km' => 450.0,
            'estimated_duration_hours' => 7.5,
            'price' => 15000.00
        ]);

        $r5 = Route::firstOrCreate(['origin' => 'Saint-Louis', 'destination' => 'Dakar'], [
            'distance_km' => 260.5,
            'estimated_duration_hours' => 4.0,
            'price' => 7500.00
        ]);

        $r6 = Route::firstOrCreate(['origin' => 'Dakar', 'destination' => 'Kaolack'], [
            'distance_km' => 192.0,
            'estimated_duration_hours' => 3.0,
            'price' => 4500.00
        ]);

        // 6. Schedules (Trajets)
        $now = Carbon::now();

        $schedulesData = [
            [
                'route_id' => $r1->id,
                'vehicle_id' => $v1->id,
                'driver_id' => $d1->id,
                'departure_time' => $now->copy()->addHours(2),
                'arrival_time' => $now->copy()->addHours(6),
                'price' => 7500.00,
                'available_seats' => 14,
                'status' => 'scheduled'
            ],
            [
                'route_id' => $r2->id,
                'vehicle_id' => $v2->id,
                'driver_id' => $d2->id,
                'departure_time' => $now->copy()->addHours(4),
                'arrival_time' => $now->copy()->addHours(5)->addMinutes(15),
                'price' => 2500.00,
                'available_seats' => 25,
                'status' => 'scheduled'
            ],
            [
                'route_id' => $r3->id,
                'vehicle_id' => $v2->id,
                'driver_id' => $d1->id,
                'departure_time' => $now->copy()->addDays(1)->setHour(7)->setMinute(30),
                'arrival_time' => $now->copy()->addDays(1)->setHour(10)->setMinute(0),
                'price' => 5000.00,
                'available_seats' => 22,
                'status' => 'scheduled'
            ],
            [
                'route_id' => $r4->id,
                'vehicle_id' => $v3->id,
                'driver_id' => $d2->id,
                'departure_time' => $now->copy()->addDays(1)->setHour(9)->setMinute(0),
                'arrival_time' => $now->copy()->addDays(1)->setHour(16)->setMinute(30),
                'price' => 15000.00,
                'available_seats' => 45,
                'status' => 'scheduled'
            ],
            [
                'route_id' => $r5->id,
                'vehicle_id' => $v1->id,
                'driver_id' => $d1->id,
                'departure_time' => $now->copy()->addDays(2)->setHour(14)->setMinute(0),
                'arrival_time' => $now->copy()->addDays(2)->setHour(18)->setMinute(0),
                'price' => 7500.00,
                'available_seats' => 18,
                'status' => 'scheduled'
            ],
            [
                'route_id' => $r6->id,
                'vehicle_id' => $v4->id,
                'driver_id' => $d1->id,
                'departure_time' => $now->copy()->addDays(2)->setHour(16)->setMinute(30),
                'arrival_time' => $now->copy()->addDays(2)->setHour(19)->setMinute(30),
                'price' => 4500.00,
                'available_seats' => 4,
                'status' => 'scheduled'
            ]
        ];

        $createdSchedules = [];
        foreach ($schedulesData as $sData) {
            $createdSchedules[] = Schedule::create($sData);
        }

        $s1 = $createdSchedules[0];
        $s2 = $createdSchedules[1];

        // 7. Reservations, Tickets & Payments for Client
        for ($i = 1; $i <= 5; $i++) {
            $ticketNumber = 'TKT-' . strtoupper(Str::random(6)) . '-' . $i;
            $qrData = json_encode([
                'ticket_number' => $ticketNumber,
                'passenger_name' => $client->name,
                'route' => 'Dakar → Saint-Louis',
                'departure' => $s1->departure_time->format('d/m/Y H:i'),
                'seat' => $i,
                'status' => 'valid'
            ]);

            $res = Reservation::create([
                'user_id' => $client->id,
                'schedule_id' => $s1->id,
                'seat_number' => $i,
                'status' => 'confirmed',
                'total_amount' => 7500.00,
                'created_at' => $now->copy()->subDays(rand(0, 5))
            ]);

            Ticket::create([
                'reservation_id' => $res->id,
                'ticket_number' => $ticketNumber,
                'qr_code' => $qrData,
                'status' => 'valid'
            ]);

            Payment::create([
                'reservation_id' => $res->id,
                'transaction_reference' => 'PAY-' . strtoupper(Str::random(10)),
                'amount' => 7500.00,
                'payment_method' => $i % 2 === 0 ? 'wave' : 'orange_money',
                'status' => 'success',
                'created_at' => $res->created_at
            ]);

            Baggage::create([
                'reservation_id' => $res->id,
                'weight_kg' => rand(8, 20),
                'tag_number' => 'BAG-' . sprintf('%04d', $i),
                'status' => 'loaded'
            ]);
        }

        // 8. Messages (Chat between Driver & Passenger)
        Message::create([
            'schedule_id' => $s1->id,
            'user_id' => $driverUser->id,
            'message' => 'Bonjour à tous ! Rendez-vous à 13h45 à la porte 3 de la Gare des Baux Maraîchers pour l\'embarquement.',
            'created_at' => $now->copy()->subMinutes(60)
        ]);

        Message::create([
            'schedule_id' => $s1->id,
            'user_id' => $client->id,
            'message' => 'Parfait merci Monsieur Marc ! J\'ai un bagage moyen avec moi.',
            'created_at' => $now->copy()->subMinutes(45)
        ]);

        Message::create([
            'schedule_id' => $s1->id,
            'user_id' => $driverUser->id,
            'message' => 'C\'est bien noté, il y a de la place dans la soute arrière climatisée.',
            'created_at' => $now->copy()->subMinutes(30)
        ]);

        // 9. Reviews for Driver
        Review::create([
            'user_id' => $client->id,
            'driver_id' => $d1->id,
            'schedule_id' => $s1->id,
            'rating' => 5,
            'comment' => 'Excellent conducteur, ponctuel et très courtois. Véhicule propre et climatisé !',
            'created_at' => $now->copy()->subDays(2)
        ]);

        Review::create([
            'user_id' => $client->id,
            'driver_id' => $d2->id,
            'schedule_id' => $s2->id,
            'rating' => 5,
            'comment' => 'Trajet très agréable et sécurisé. Je recommande vivement.',
            'created_at' => $now->copy()->subDays(4)
        ]);

        // 10. Notifications
        Notification::create([
            'user_id' => $client->id,
            'title' => '🎉 Réservation confirmée',
            'message' => 'Votre billet pour Dakar → Saint-Louis est prêt. N\'oubliez pas de présenter votre QR Code.',
            'type' => 'success',
            'is_read' => false
        ]);

        Notification::create([
            'user_id' => $driverUser->id,
            'title' => '🚗 Nouveau départ planifié',
            'message' => 'Votre trajet Dakar → Saint-Louis démarre dans 2 heures. 5 passagers confirmés.',
            'type' => 'info',
            'is_read' => false
        ]);

        Notification::create([
            'user_id' => $admin->id,
            'title' => '📊 Rapport journalier',
            'message' => 'Revenus du jour : +45 000 FCFA avec 6 départs programmés.',
            'type' => 'info',
            'is_read' => false
        ]);
    }
}
