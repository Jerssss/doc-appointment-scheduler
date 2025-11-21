<?php
require '../vendor/autoload.php';
header("Content-Type: application/json");

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['appointment_id'])) {
    echo json_encode(['success' => false, 'error' => 'No appointment ID provided']);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointments = $client->MediKo->appointments;

    $result = $appointments->updateOne(
        ['_id' => new MongoDB\BSON\ObjectId($input['appointment_id'])],
        ['$set' => ['status' => 'completed']]
    );

    if ($result->getModifiedCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No appointment updated']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
