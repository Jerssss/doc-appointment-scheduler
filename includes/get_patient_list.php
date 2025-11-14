<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $patientCollection = $client->MediKo->patientdetails;

    // Join patientdetails -> users using user_id
    $pipeline = [
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'user_id',
                'foreignField' => 'user_id',
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
        $result[] = [
            '_id' => (string)$doc['_id'],
            'name' => $doc['user_info']['name'] ?? "Unknown Patient",
            'image' => $doc['user_info']['profile_image'] ?? "images/default-patient.png"
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
