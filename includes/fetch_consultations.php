<?php
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $consultation = $client->MediKo->consultation;
    $users = $client->MediKo->users;

    $doctor_id = isset($_GET['doctor_id']) ? $_GET['doctor_id'] : null;

    if (!$doctor_id) {
        echo json_encode([]);
        exit;
    }

    // Aggregation: match doctor_id then lookup patient info

    $pipeline = [
        ['$match' => ['doctor_id' => new MongoDB\BSON\ObjectId($doctor_id)]],
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'patient_id',
                'foreignField' => 'user_id',
                'as' => 'patientInfo'
                ]
            ],
            ['$unwind' => ['path' => '$patientInfo', 'preserveNullAndEmptyArrays' => true]],
            ['$sort' => ['created_at' => -1]]
        ];


    $cursor = $consultation->aggregate($pipeline);
    
    $out = [];
    foreach ($cursor as $doc) {
        $out[] = [
            'consultation_id'  => (string)($doc['consultation_id'] ?? ''),
            'patient_id'       => (string)($doc['patient_id'] ?? ''),
            'doctor_id'        => (string)($doc['doctor_id'] ?? ''),
            'medical_history'  => $doc['medical_history'] ?? '',
            'current_conditions' => $doc['current_conditions'] ?? '',
            'consultation_notes' => $doc['consultation_notes'] ?? '',
            'follow_up_date'   => isset($doc['follow_up_date']) ? $doc['follow_up_date']->toDateTime()->format('c') : '',
            'created_at'       => isset($doc['created_at']) ? $doc['created_at']->toDateTime()->format('c') : '',
            'patient' => [
                'user_id'       => isset($doc['patientInfo']['user_id']) ? (string)$doc['patientInfo']['user_id'] : '',
                'name'          => $doc['patientInfo']['personal_info']['full_name'] ?? 'Unknown Patient',
                'profile_image' => $doc['patientInfo']['profile_image'] ?? 'images/default-patient.png',
                ]
            ];
        }
        
        echo json_encode($out);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}