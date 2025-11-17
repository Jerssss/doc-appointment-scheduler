<?php
require __DIR__ . '/../vendor/autoload.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(['error' => 'No patient ID']);
    exit;
}

$id = $_GET['id']; // This should be the _id from users

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $patientCollection = $client->MediKo->patientdetails;
    $usersCollection = $client->MediKo->users;

    // Find patientdetails by user_id (which is an ObjectId)
    $patient = $patientCollection->findOne([
        'user_id' => new MongoDB\BSON\ObjectId($id)
    ]);

    if (!$patient) {
        echo json_encode(['error' => 'Patient details not found']);
        exit;
    }

    // Now find the user info
    $user = $usersCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    if (!$user) {
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Calculate age from user.personal_info.date_of_birth
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

    $data = [
        'name' => $user['personal_info']['full_name'] ?? 'Unknown',
        'age' => $age,
        'gender' => $user['personal_info']['sex'] ?? 'N/A',
        'address' => $user['personal_info']['address'] ?? 'N/A',
        'illness' => $patient['illness'] ?? '',
        'past_medical_conditions' => $patient['past_medical_conditions'] ?? [],
        'past_surgeries' => $patient['past_surgeries'] ?? [],
        'current_medical_conditions' => $patient['current_medical_conditions'] ?? [],
        'last_appointment_date' => isset($patient['last_appointment_date']) ? $patient['last_appointment_date']->toDateTime()->format('Y-m-d') : null,
        'profile_image' => $user['profile_image'] ?? 'images/default-patient.png'
    ];

    header('Content-Type: application/json');
    echo json_encode($data);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
