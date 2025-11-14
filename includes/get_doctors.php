<?php
require __DIR__ . '/../vendor/autoload.php'; // MongoDB PHP library

header('Content-Type: application/json');

try {
    // Connect to MongoDB
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->Mediko->users;

    // Fetch all doctors
    $doctorsCursor = $usersCollection->find(['role' => 'doctor']);

    $doctors = [];

    foreach ($doctorsCursor as $doc) {
        $doctors[] = [
            'user_id'        => $doc['user_id'] ?? '',
            'user_name'      => $doc['user_name'] ?? '',
            'name'           => $doc['name'] ?? '',
            'profile_image'  => $doc['profile_image'] ?? 'images/default-doctor.png',
            'specialization' => $doc['specialization'] ?? '',
            'fee'            => $doc['fee'] ?? '',
            'languages'      => $doc['languages'] ?? '',
            'hospital_name'  => $doc['hospital_name'] ?? '',
            'hospital_phone' => $doc['hospital_phone'] ?? '',
            'hospital_address' => $doc['hospital_address'] ?? '',
            'clinic_hours'   => $doc['clinic_hours'] ?? '',
            'rating'         => $doc['rating'] ?? '',
            'reviews'        => $doc['reviews'] ?? '',
            'services'       => $doc['services'] ?? ''
        ];
    }

    echo json_encode($doctors);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
?>
