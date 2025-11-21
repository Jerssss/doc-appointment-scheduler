<?php
require __DIR__ . '/../vendor/autoload.php';
header("Content-Type: application/json");


try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointmentsCollection = $client->MediKo->appointments;
    $usersCollection = $client->MediKo->users;


    $doctorId = $_GET['doctor_id'] ?? null;


    if (!$doctorId) {
        echo json_encode([]);
        exit;
    }


    // Convert doctorId (string from frontend) into ObjectId
    try {
        $doctorObjectId = new MongoDB\BSON\ObjectId($doctorId);
    } catch (Exception $e) {
        echo json_encode([]);
        exit;
    }


    // AGGREGATION PIPELINE
    $pipeline = [
        // Match ONLY appointments belonging to this doctor
        [
            '$match' => [
                'doctor_id' => $doctorObjectId
            ]
        ],


        // Ensure patient_id is an ObjectId for proper lookup
        [
            '$addFields' => [
                'patient_id_obj' => [
                    '$cond' => [
                        [
                            '$eq' => [
                                ['$type' => '$patient_id'],
                                'string'
                            ]
                        ],
                        ['$toObjectId' => '$patient_id'],
                        '$patient_id'
                    ]
                ]
            ]
        ],


        // Lookup patient information from users collection using _id
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'patient_id_obj',
                'foreignField' => 'user_id',
                'as' => 'patient_info'
            ]
        ],


        // Unwind the array but allow nulls if no match
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
        $patient = $appt['patient_info'] ?? null;


        // Defaults
        $patientName = "Unknown Patient";
        $patientImage = "images/default-patient.png";
        $gender = "N/A";
        $address = "N/A";
        $age = "N/A";


        // If patient exists, override defaults
        if ($patient && isset($patient['personal_info']['full_name'])) {
            $patientName = $patient['personal_info']['full_name'];
            $patientImage = $patient['profile_image'] ?? "images/default-patient.png";
            $gender = $patient['personal_info']['sex'] ?? "N/A";
            $address = $patient['personal_info']['address'] ?? "N/A";


            // Calculate age
            if (!empty($patient['personal_info']['date_of_birth'])) {
                try {
                    $dob = new DateTime($patient['personal_info']['date_of_birth']);
                    $now = new DateTime();
                    $age = $now->diff($dob)->y;
                } catch (Exception $e) {
                    $age = "N/A";
                }
            }
        }


        // Convert time to ISO
        $timeISO = null;
        if (isset($appt['time']) && $appt['time'] instanceof MongoDB\BSON\UTCDateTime) {
            $timeISO = $appt['time']->toDateTime()->format('c');
        } elseif (isset($appt['time'])) {
            $timeISO = (string)$appt['time'];
        }


        $result[] = [
            'patient_id' => isset($patient['user_id']) ? (string)$patient['user_id'] : '',
            'patient_name' => $patientName,
            'patient_image' => $patientImage,
            'age' => $age,
            'gender' => $gender,
            'address' => $address,
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
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
