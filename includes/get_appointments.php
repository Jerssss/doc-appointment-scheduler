<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointmentsCollection = $client->MediKo->appointments;

    // Pipeline:
    // 1) lookup patientdetails by appointments.patient_id -> patientdetails._id
    // 2) unwind patientdetails
    // 3) lookup users by patientdetails.user_id -> users.user_id
    // 4) unwind users
    $pipeline = [
        [
            '$lookup' => [
                'from' => 'patientdetails',
                'localField' => 'patient_id',
                'foreignField' => '_id',
                'as' => 'patient_details'
            ]
        ],
        [
            '$unwind' => [
                'path' => '$patient_details',
                'preserveNullAndEmptyArrays' => true
            ]
        ],
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'patient_details.user_id',
                'foreignField' => 'user_id',
                'as' => 'user_info'
            ]
        ],
        [
            '$unwind' => [
                'path' => '$user_info',
                'preserveNullAndEmptyArrays' => true
            ]
        ],
        // optional: sort appointments by time ascending
        [ '$sort' => [ 'time' => 1 ] ]
    ];

    $cursor = $appointmentsCollection->aggregate($pipeline);
    $result = [];

    foreach ($cursor as $appt) {
        // normalize time to ISO (frontend-friendly). appt['time'] may be BSON\UTCDateTime
        $timeISO = null;
        if (isset($appt['time']) && $appt['time'] instanceof MongoDB\BSON\UTCDateTime) {
            $timeISO = $appt['time']->toDateTime()->format(DATE_ATOM);
        } elseif (isset($appt['time']) && is_string($appt['time'])) {
            $timeISO = $appt['time'];
        }

        $result[] = [
            '_id' => (string)$appt['_id'],
            'patient_id' => isset($appt['patient_id']) && $appt['patient_id'] instanceof MongoDB\BSON\ObjectId ? (string)$appt['patient_id'] : (string)($appt['patient_id'] ?? ''),
            'patient_name' => $appt['user_info']['name'] ?? ($appt['patient_details']['name'] ?? "Unknown Patient"),
            'patient_image' => $appt['user_info']['profile_image'] ?? "images/default-patient.png",
            'age' => $appt['age'] ?? ($appt['patient_details']['age'] ?? 'N/A'),
            'gender' => $appt['gender'] ?? ($appt['patient_details']['gender'] ?? 'N/A'),
            'address' => $appt['address'] ?? ($appt['patient_details']['address'] ?? 'N/A'),
            'temperature' => $appt['temperature'] ?? '-',
            'blood_pressure' => $appt['blood_pressure'] ?? '-',
            'heart_rate' => $appt['heart_rate'] ?? '-',
            'height_weight' => $appt['height_weight'] ?? '-',
            'time' => $timeISO,
            'mode' => $appt['mode'] ?? '-',
            'status' => $appt['status'] ?? '-',
            'notes' => $appt['notes'] ?? ''
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
