<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $data['title'] ?? 'Votre billet de transport' }}</title>
    <style>
        body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #0f172a; }
        .wrapper { padding: 32px 16px; }
        .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 32px rgba(2, 44, 34, 0.12); }
        .hero { background: linear-gradient(135deg, #0b3d2e, #157a54); color: #ffffff; padding: 32px 36px; }
        .hero .brand { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px; opacity: 0.9; }
        .hero h1 { margin: 16px 0 6px; font-size: 24px; line-height: 1.3; }
        .hero p { margin: 0; opacity: 0.9; font-size: 14px; }
        .badge-valid { display: inline-block; margin-top: 14px; background: #34d399; color: #04150e; font-weight: 700; font-size: 12px; padding: 5px 14px; border-radius: 999px; }
        .body { padding: 28px 36px 36px; }
        .ref { display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1px dashed #157a54; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; }
        .ref .num { font: 700 16px/1 Consolas, monospace; color: #0b3d2e; }
        .route-box { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .route-box .city { text-align: center; }
        .route-box .city .name { display: block; font: 800 20px/1.2 'Arial', sans-serif; }
        .route-box .city .label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .route-box .arrow { display: flex; flex-direction: column; align-items: center; color: #157a54; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .detail { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
        .detail .k { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 4px; }
        .detail .v { font-size: 15px; font-weight: 700; }
        .qr-wrap { text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 12px; }
        .qr-wrap img { width: 180px; height: 180px; image-rendering: pixelated; }
        .qr-wrap .hint { margin-top: 10px; font-size: 12.5px; color: #475569; }
        .footer { text-align: center; margin: 24px 36px 0; padding-top: 18px; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; }
        .btn { display: inline-block; background: #157a54; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 12px 26px; border-radius: 10px; margin-top: 8px; }
        .fund { text-align: center; margin-top: 22px; font-size: 11.5px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="hero">
                <div class="brand">🚌 TransExpress — Plateforme de Transport &amp; Covoiturage</div>
                <h1>{{ $data['title'] ?? 'Réservation confirmée !' }}</h1>
                <p>Votre trajet
                    <strong>{{ $data['origin'] ?? '' }} → {{ $data['destination'] ?? '' }}</strong>
                    a bien été enregistré. Présentez le QR Code ci-dessous à l'embarquement.
                </p>
                <span class="badge-valid">✅ Billet VALIDE</span>
            </div>

            <div class="body">
                <div class="ref">
                    <span style="font-size:12px; color:#475569; font-weight:600;">Numéro de billet</span>
                    <span class="num">{{ $data['ticket_number'] ?? 'N/A' }}</span>
                </div>

                <div class="route-box">
                    <div class="city">
                        <span class="label">Départ</span>
                        <span class="name">{{ $data['origin'] ?? '—' }}</span>
                        <span style="font-size:13px; color:#475569;">{{ $data['departure_time'] ?? '' }}</span>
                    </div>
                    <div class="arrow">
                        <span style="font-size:26px; line-height:1;">→</span>
                        <span>{{ $data['duration_hours'] ?? '' }} h estimées</span>
                    </div>
                    <div class="city">
                        <span class="label">Arrivée</span>
                        <span class="name">{{ $data['destination'] ?? '—' }}</span>
                        <span style="font-size:13px; color:#475569;">{{ $data['arrival_time'] ?? '' }}</span>
                    </div>
                </div>

                <div class="details">
                    <div class="detail">
                        <div class="k">Passager</div>
                        <div class="v">{{ $data['passenger_name'] ?? '—' }}</div>
                    </div>
                    <div class="detail">
                        <div class="k">Siège</div>
                        <div class="v">N° {{ $data['seat'] ?? '—' }}</div>
                    </div>
                    <div class="detail">
                        <div class="k">Véhicule</div>
                        <div class="v">{{ $data['vehicle'] ?? '—' }}</div>
                    </div>
                    <div class="detail">
                        <div class="k">Montant payé</div>
                        <div class="v">{{ number_format((float) ($data['total_amount'] ?? 0), 0, ',', ' ') }} FCFA</div>
                    </div>
                </div>

                <div class="qr-wrap">
                    @if (!empty($data['qr_code']))
                        <img src="{{ $data['qr_code'] }}" alt="QR Code du billet">
                    @endif
                    <div class="hint">📲 Présentez ce QR Code au conducteur ou scannez-le au guichet pour valider l'embarquement.</div>
                </div>

                <div class="footer">
                    <a href="{{ $data['app_url'] ?? '#' }}" class="btn">Voir mes réservations</a>
                    <p>Besoin d'aide ? Contactez votre agence de départ pour toute modification.</p>
                    <p>Référence paiement : <strong>{{ $data['transaction_reference'] ?? '—' }}</strong></p>
                </div>

                <div class="fund">© {{ date('Y') }} TransExpress. Billet généré électroniquement — aucun papier requis.</div>
            </div>
        </div>
    </div>
</body>
</html>