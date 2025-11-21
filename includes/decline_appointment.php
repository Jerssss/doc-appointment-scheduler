<?php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $appointments = $client->MediKo->appointments;

    $input = json_decode(file_get_contents('php://input'), true);
    $appointment_id = $input['appointment_id'] ?? null;

    if (!$appointment_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Appointment ID is required']);
        exit;
    }

    try {
        $apptOid = new MongoDB\BSON\ObjectId($appointment_id);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Invalid appointment ID']);
        exit;
    }

    $result = $appointments->updateOne(
        ['_id' => $apptOid],
        [
            '$set' => [
                'status' => 'declined',
                'declined_at' => new MongoDB\BSON\UTCDateTime()
            ]
        ]
    );

    if ($result->getModifiedCount() === 1) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Appointment not found or already declined']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>