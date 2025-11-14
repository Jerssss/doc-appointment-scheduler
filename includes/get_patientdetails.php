<?php
require __DIR__ . '/../vendor/autoload.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No patient ID']);
    exit;
}

$id = $_GET['id'];

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $patientCollection = $client->MediKo->patientdetails;
    $usersCollection = $client->MediKo->users;

    // find patientdetails by _id
    $patient = $patientCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    if (!$patient) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Patient not found']);
        exit;
    }

    // try to find related user record via patient.user_id
    $user = null;
    if (isset($patient['user_id'])) {
        $user = $usersCollection->findOne(['user_id' => $patient['user_id']]);
    }

    // prepare response
    $data = [
        'id' => (string)$patient['_id'],
        'user_id' => $patient['user_id'] ?? null,
        'name' => $user['name'] ?? 'Unknown Patient',
        'profile_image' => $user['profile_image'] ?? 'images/default-patient.png',
        'birth_date' => isset($patient['birth_date']) ? $patient['birth_date']->toDateTime()->format('Y-m-d') : null,
        'address' => $patient['address'] ?? '',
        'illness' => $patient['illness'] ?? '',
        'emergency_contact' => $patient['emergency_contact'] ?? '',
        'past_medical_conditions' => $patient['past_medical_conditions'] ?? [],
        'past_surgeries' => $patient['past_surgeries'] ?? [],
        'current_medical_conditions' => $patient['current_medical_conditions'] ?? [],
        'last_appointment_date' => isset($patient['last_appointment_date']) ? $patient['last_appointment_date']->toDateTime()->format('Y-m-d') : null
    ];

    header('Content-Type: application/json');
    echo json_encode($data);

} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
