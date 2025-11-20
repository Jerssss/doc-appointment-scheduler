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

    $doctorObjectId = new MongoDB\BSON\ObjectId($doctorId);


    $pipeline = [
        [
            '$match' => [
                '$or' => [
                    [ 'doctor_id' => $doctorObjectId ],       // ObjectId
                    [ 'doctor_id' => $doctorId ]             // string fallback
                ]
            ]
        ],
        [
            '$addFields' => [
                'patient_id_obj' => [
                    '$toObjectId' => '$patient_id'
                ]
            ]
        ],
        [
            '$lookup' => [
                'from' => 'users',
                'localField' => 'patient_id_obj',
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
      $patient = $appt['patient_info'] ?? null;

      // Get name safely
      $patientName = "Unknown Patient";
      $patientImage = "images/default-patient.png";
      $gender = "N/A";
      $address = "N/A";
      $age = "N/A";

      if ($patient && isset($patient['personal_info']['full_name'])) {
          $patientName = $patient['personal_info']['full_name'];
          $patientImage = $patient['profile_image'] ?? "images/default-patient.png";
          $gender = $patient['personal_info']['sex'] ?? "N/A";
          $address = $patient['personal_info']['address'] ?? "N/A";

          // Calculate age from date_of_birth
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

      // Convert time
      $timeISO = null;
      if (isset($appt['time']) && $appt['time'] instanceof MongoDB\BSON\UTCDateTime) {
          $timeISO = $appt['time']->toDateTime()->format('c');
      }

      $result[] = [
        'patient_id' => (string)($patient['_id'] ?? null), // <-- added patient id as string
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

    header('Content-Type: application/json');
    echo json_encode($result, JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}