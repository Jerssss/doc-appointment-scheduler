<?php
require __DIR__ . '/../vendor/autoload.php'; // MongoDB PHP library

header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->Mediko->users;

    // Expect ?user_id=...
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    if (!$user_id) {
        echo json_encode(['error' => 'user_id is required']);
        exit;
    }

    $doctor = $usersCollection->findOne(['user_id' => $user_id]);

    if ($doctor === null) {
        echo json_encode(['error' => 'Doctor not found']);
        exit;
    }

    // Prepare return structure (flatten mongo doc)
    $out = [
        'user_id'       => $doctor['user_id'] ?? '',
        'user_name'     => $doctor['user_name'] ?? '',
        'user_email'    => $doctor['user_email'] ?? '',
        'role'          => $doctor['role'] ?? '',
        'name'          => $doctor['name'] ?? '',
        'profile_image' => $doctor['profile_image'] ?? 'images/default-doctor.png',
        // optional fields: let frontend handle missing keys
        'specialization'=> $doctor['specialization'] ?? '',
        'hospital_name' => $doctor['hospital_name'] ?? '',
        'hospital_phone'=> $doctor['hospital_phone'] ?? '',
        'hospital_address'=> $doctor['hospital_address'] ?? '',
        'fee'           => $doctor['fee'] ?? '',
        'languages'     => $doctor['languages'] ?? '',
        'rating'        => $doctor['rating'] ?? '',
        'reviews'       => $doctor['reviews'] ?? ''
    ];

    echo json_encode($out);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
