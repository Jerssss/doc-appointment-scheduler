<?php
require __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $appointments = $client->Mediko->appointments;

    $input = json_decode(file_get_contents('php://input'), true);
    $appointment_id = $input['appointment_id'] ?? null;

    if (!$appointment_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'appointment_id required']);
        exit;
    }

    $result = $appointments->updateOne(
        ['appointment_id' => $appointment_id],
        ['$set' => ['status' => 'cancelled', 'cancelled_at' => (new DateTime('now', new DateTimeZone('UTC')))->format(DateTime::ATOM)]]
    );

    if ($result->getModifiedCount() === 1) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No matching appointment found or already cancelled']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
