<?php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->MediKo->users;

    $user_id = $_GET['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode(["error" => "user_id is required"]);
        exit;
    }

    // Try to convert to ObjectId if it's a valid ObjectId string
    try {
        $user_id_object = new MongoDB\BSON\ObjectId($user_id);
        // Try finding by ObjectId first
        $doctor = $usersCollection->findOne(['user_id' => $user_id_object]);
    } catch (Exception $e) {
        // If conversion fails, try as string
        $doctor = $usersCollection->findOne(['user_id' => $user_id]);
    }

    // If not found by user_id, try by _id
    if (!$doctor) {
        try {
            $id_object = new MongoDB\BSON\ObjectId($user_id);
            $doctor = $usersCollection->findOne(['_id' => $id_object]);
        } catch (Exception $e) {
            // Ignore conversion error
        }
    }

    if (!$doctor) {
        echo json_encode(["error" => "Doctor not found"]);
        exit;
    }

    $info = $doctor['personal_info'] ?? [];
    $userName = $doctor['user_name'] ?? ($doctor['username'] ?? '');
    $fullName = $info['full_name'] ?? '';
    if (!$fullName || trim($fullName) === '') {
        $fullName = $userName;
    }

    $out = [
        "user_id"         => $doctor['user_id'] ?? '',
        "user_name"       => $userName,
        "user_email"      => $doctor['user_email'] ?? '',
        "role"            => $doctor['role'] ?? 'doctor',
        "username"        => $userName, // Add alias for compatibility

        // Flattened info with fallback
        "full_name"       => $fullName,
        "specialization"  => $info['specialization'] ?? '',
        "fee"             => $info['fee'] ?? '',
        "rating"          => $info['rating'] ?? '',
        "reviews"         => $info['reviews'] ?? '',
        "services"        => $info['services'] ?? '',
        "languages"       => $info['languages'] ?? '',
        "titles"          => $info['titles'] ?? '',
        "hospital_title"  => $info['hospital_title'] ?? '',

        "hospital_name"   => $info['hospital_name'] ?? '',
        "hospital_phone"  => $info['hospital_phone'] ?? '',
        "hospital_address"=> $info['hospital_address'] ?? '',
        "clinic_hours"    => $info['clinic_hours'] ?? '',

        "profile_image"   => $info['profile_image'] ?? 'images/default-doctor.png',
        "hospital_image"  => $info['hospital_image'] ?? 'images/bgh.png'
    ];

    echo json_encode($out);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
