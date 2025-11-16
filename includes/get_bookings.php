<?php
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $appointments = $client->Mediko->appointments;
    $users = $client->Mediko->users;

    $patient_id = isset($_GET['patient_id']) ? $_GET['patient_id'] : null;

    if (!$patient_id) {
        echo json_encode([]);
        exit;
    }

    // Aggregation: match patient_id then lookup doctor info
    $pipeline = [
        ['$match' => ['patient_id' => $patient_id]],
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'doctor_id',
                'foreignField' => 'user_id',
                'as' => 'doctorInfo'
            ]
        ],
        ['$unwind' => ['path' => '$doctorInfo', 'preserveNullAndEmptyArrays' => true]],
        ['$sort' => ['created_at' => -1]]
    ];

    $cursor = $appointments->aggregate($pipeline);

    $out = [];
    foreach ($cursor as $doc) {
        $out[] = [
            'appointment_id' => $doc['appointment_id'] ?? '',
            'patient_id'     => $doc['patient_id'] ?? '',
            'doctor_id'      => $doc['doctor_id'] ?? '',
            'schedule'       => $doc['schedule'] ?? '',
            'reason'         => $doc['reason'] ?? '',
            'prescriptions'  => $doc['prescriptions'] ?? '',
            'status'         => $doc['status'] ?? '',
            'created_at'     => $doc['created_at'] ?? '',
            'doctor' => [
                'user_id' => $doc['doctorInfo']['user_id'] ?? '',
                'name'    => $doc['doctorInfo']['name'] ?? '',
                'profile_image' => $doc['doctorInfo']['profile_image'] ?? 'images/default-doctor.png',
                'specialization' => $doc['doctorInfo']['specialization'] ?? ''
            ]
        ];
    }

    echo json_encode($out);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
