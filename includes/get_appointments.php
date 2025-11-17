<?php
require __DIR__ . '/../vendor/autoload.php';
header("Content-Type: application/json");

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointmentsCollection = $client->MediKo->appointments;
    $usersCollection = $client->MediKo->users;

    // Get user_id from frontend (sessionStorage)
    $userId = $_GET['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(["error" => "Missing user_id"]);
        exit;
    }

    // Convert user_id to ObjectId
    $userObjId = new MongoDB\BSON\ObjectId($userId);

    // Pipeline with MATCH by patient_id
    $pipeline = [
        [
            '$match' => [
                'patient_id' => $userObjId
            ]
        ],
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'patient_id',
                'foreignField' => '_id',
                'as' => 'patient_info'
            ]
        ],
        [
            '$unwind' => [
                'path' => '$patient_info',
                'preserveNullAndEmptyArrays' => true
            ]
        ],
        [ '$sort' => [ 'time' => 1 ] ]
    ];

    $cursor = $appointmentsCollection->aggregate($pipeline);
    $result = [];

    foreach ($cursor as $appt) {

        // Patient details
        $patient = $appt['patient_info'] ?? null;
        $patientName = $patient['personal_info']['full_name'] ?? "Unknown Patient";
        $patientImage = $patient['profile_image'] ?? "images/default-patient.png";
        $gender = $patient['personal_info']['sex'] ?? "N/A";
        $address = $patient['personal_info']['address'] ?? "N/A";

        // Age calculation
        $age = "N/A";
        if (!empty($patient['personal_info']['date_of_birth'])) {
            try {
                $dob = new DateTime($patient['personal_info']['date_of_birth']);
                $now = new DateTime();
                $age = $now->diff($dob)->y;
            } catch (Exception $e) {}
        }

        // Convert MongoDB time
        $timeISO = null;
        if (isset($appt['time']) && $appt['time'] instanceof MongoDB\BSON\UTCDateTime) {
            $timeISO = $appt['time']->toDateTime()->format('c');
        }

        $result[] = [
            'patient_name' => $patientName,
            'patient_image' => $patientImage,
            'gender' => $gender,
            'address' => $address,
            'age' => $age,
            'temperature' => $appt['temperature'] ?? '-',
            'blood_pressure' => $appt['blood_pressure'] ?? '-',
            'heart_rate' => $appt['heart_rate'] ?? '-',
            'height_weight' => $appt['height_weight'] ?? '-',
            'time' => $timeISO,
            'mode' => $appt['mode'] ?? 'N/A',
            'status' => $appt['status'] ?? 'pending',
            'notes' => $appt['notes'] ?? ''
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
