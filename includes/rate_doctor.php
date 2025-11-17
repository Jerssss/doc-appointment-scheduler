<?php
session_start();
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$appointmentId = $input['appointment_id'] ?? null;
$rating = intval($input['rating'] ?? 0);

if (!$appointmentId || $rating < 1 || $rating > 5) {
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $appointmentsCol = $client->MediKo->appointments;
    $usersCol = $client->MediKo->users;

    // Find appointment
    $appt = $appointmentsCol->findOne(['_id' => new MongoDB\BSON\ObjectId($appointmentId)]);
    if (!$appt) {
        echo json_encode(['error' => 'Appointment not found']);
        exit;
    }

    $doctorId = $appt['doctor_id'];

    // Update doctor using user_id field
    $usersCol->updateOne(
        ['$or' => [
            ['user_id' => $doctorId],
            ['user_id' => new MongoDB\BSON\ObjectId($doctorId)]
        ]],
        ['$push' => ['ratings' => $rating]]
    );

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
