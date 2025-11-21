<?php
require __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

header('Content-Type: application/json');

try {
    // accept either ?user_id=... or ?id=...
    $id = $_GET['user_id'] ?? ($_GET['id'] ?? null);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'No patient ID provided (expected user_id or id)']);
        exit;
    }

    // validate ObjectId format
    try {
        $objId = new ObjectId($id);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id format']);
        exit;
    }

    $client = new Client("mongodb://localhost:27017");
    $patientCollection = $client->MediKo->patientdetails;
    $usersCollection = $client->MediKo->users;

    // Find patientdetails by user_id (stored as ObjectId)
    $patient = $patientCollection->findOne(['user_id' => $objId]);
    if (!$patient) {
        http_response_code(404);
        echo json_encode(['error' => 'Patient details not found']);
        exit;
    }

    // Find user info — some apps store the user lookup under _id, others under user_id.
    // Try both to be safe.
    $user = $usersCollection->findOne(['user_id' => $objId]) ?: $usersCollection->findOne(['_id' => $objId]);
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // age
    $age = "N/A";
    if (!empty($user['personal_info']['date_of_birth'])) {
        try {
            $dob = new DateTime($user['personal_info']['date_of_birth']);
            $now = new DateTime();
            $age = $now->diff($dob)->y;
        } catch (Exception $e) {
            $age = "N/A";
        }
    }

    $lastAppt = null;
    if (isset($patient['last_appointment_date'])) {
        if ($patient['last_appointment_date'] instanceof MongoDB\BSON\UTCDateTime) {
            $lastAppt = $patient['last_appointment_date']->toDateTime()->format('Y-m-d');
        } elseif (is_string($patient['last_appointment_date'])) {
            $lastAppt = $patient['last_appointment_date'];
        }
    }

    $data = [
        'name' => $user['personal_info']['full_name'] ?? ($user['user_name'] ?? 'Unknown'),
        'age' => $age,
        'gender' => $user['personal_info']['sex'] ?? 'N/A',
        'address' => $user['personal_info']['address'] ?? 'N/A',
        'illness' => $patient['illness'] ?? '',
        'past_medical_conditions' => $patient['past_medical_conditions'] ?? [],
        'past_surgeries' => $patient['past_surgeries'] ?? [],
        'current_medical_conditions' => $patient['current_medical_conditions'] ?? [],
        'last_appointment_date' => $lastAppt,
        'profile_image' => $user['profile_image'] ?? 'images/default-patient.png'
    ];

    echo json_encode($data);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
}
