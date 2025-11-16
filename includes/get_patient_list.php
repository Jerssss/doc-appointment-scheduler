<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $patientCollection = $client->MediKo->patientdetails;
    $usersCollection = $client->MediKo->users;

    // patientdetails.user_id → users._id
    $pipeline = [
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'user_id',
                'foreignField' => '_id',   // correct relation
                'as' => 'user_info'
            ]
        ],
        [
            '$unwind' => [
                'path' => '$user_info',
                'preserveNullAndEmptyArrays' => true
            ]
        ]
    ];

    $cursor = $patientCollection->aggregate($pipeline);
    $result = [];

    foreach ($cursor as $doc) {

        // Fix: Get patient full name
        $fullName =
            $doc['user_info']['personal_info']['full_name']
                ?? $doc['user_info']['user_name']
                ?? "Unknown Patient";

        // Fix: Get patient image
        $image =
            $doc['user_info']['profile_image']
                ?? "images/default-patient.png";

        $result[] = [
            '_id' => (string)$doc['_id'],
            'name' => $fullName,
            'image' => $image
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
