<?php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->MediKo->users;

    // Get search term
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    // Base filter: only doctors
    $filter = ['role' => 'doctor'];

    // If searching, add regex filter
    if ($search !== '') {
        $filter['$or'] = [
            ['personal_info.full_name' => ['$regex' => $search, '$options' => 'i']],
            ['personal_info.specialization' => ['$regex' => $search, '$options' => 'i']],
            ['user_name' => ['$regex' => $search, '$options' => 'i']]
        ];
    }

    // Fetch docs with filter
    $cursor = $usersCollection->find($filter);

    $out = [];

    foreach ($cursor as $doc) {
        $info = $doc['personal_info'] ?? [];

        $userName = $doc['user_name'] ?? ($doc['username'] ?? '');
        $fullName = $info['full_name'] ?? '';
        if (!$fullName || trim($fullName) === '') {
            $fullName = $userName;
        }

        $out[] = [
            "user_id"         => $doc['user_id'] ?? '',
            "user_name"       => $userName,
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
    }

    echo json_encode($out);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
