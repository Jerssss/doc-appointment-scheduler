<?php
require __DIR__ . '/../vendor/autoload.php';
session_start();

// Assuming patient is logged in and session has patient_id
$patient_id = $_SESSION['patient_id'] ?? null;

if (!$patient_id) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointmentsCollection = $client->MediKo->appointments;
    $usersCollection = $client->MediKo->users;
    $patientDetailsCollection = $client->MediKo->patientdetails;

    // Get latest completed appointment for this patient
    $appointment = $appointmentsCollection->findOne(
        ['patient_id' => new MongoDB\BSON\ObjectId($patient_id), 'status' => 'completed'],
        ['sort' => ['time' => -1]]
    );

    if (!$appointment) {
        echo json_encode(['error' => 'No completed appointment found']);
        exit;
    }

    // Fetch patient and doctor info
    $patientDetails = $patientDetailsCollection->findOne(['_id' => $appointment['patient_id']]);
    $user = $usersCollection->findOne(['_id' => $patientDetails['user_id']]);

    $doctor = $usersCollection->findOne(['_id' => $appointment['doctor_id']]);

    $data = [
        'patient_name' => $user['personal_info']['full_name'] ?? $user['user_name'],
        'username' => $user['user_name'],
        'email' => $user['user_email'],
        'appointment_time' => isset($appointment['time']) ? $appointment['time']->toDateTime()->format('h:i A') : '',
        'appointment_type' => $appointment['mode'] . ' Consultation / Checkup',
        'doctor_name' => $doctor['personal_info']['full_name'] ?? $doctor['user_name'],
        'fee' => $doctor['personal_info']['fee'] ?? 0,
        'appointment_id' => (string)$appointment['_id']
    ];

    echo json_encode($data);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
