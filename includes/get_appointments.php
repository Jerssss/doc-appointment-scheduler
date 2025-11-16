<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointmentsCollection = $client->MediKo->appointments;

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
                'foreignField' => '_id',
                'as' => 'user_info'
            ]
        ],
        [
            '$unwind' => [
                'path' => '$user_info',
                'preserveNullAndEmptyArrays' => true
            ]
        ],
        [ '$sort' => [ 'time' => 1 ] ]
    ];

    $cursor = $appointmentsCollection->aggregate($pipeline);
    $result = [];

    foreach ($cursor as $appt) {

        // time
        $timeISO = null;
        if (isset($appt['time']) && $appt['time'] instanceof MongoDB\BSON\UTCDateTime) {
            $timeISO = $appt['time']->toDateTime()->format(DATE_ATOM);
        }

        // extract personal info (NEW structure)
        $pinfo = $appt['user_info']['personal_info'] ?? [];

        // full name
        $patientName = $pinfo['full_name'] ?? "Unknown Patient";

        // profile image
        $patientImage = $appt['user_info']['profile_image']
            ?? "images/default-patient.png";

        // gender
        $gender = $pinfo['sex'] ?? 'N/A';

        // address
        $address = $pinfo['address'] ?? 'N/A';

        // AGE — calculate from date_of_birth
        $age = 'N/A';
        if (!empty($pinfo['date_of_birth'])) {
            try {
                $dob = new DateTime($pinfo['date_of_birth']);
                $today = new DateTime();
                $age = $today->diff($dob)->y;
            } catch (Exception $e) {}
        }

        $result[] = [
            '_id' => (string)$appt['_id'],
            'patient_id' => (string)$appt['patient_id'],
            'patient_name' => $patientName,
            'patient_image' => $patientImage,

            'age' => $age,
            'gender' => $gender,
            'address' => $address,

            // vitals (appointments still contain them)
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