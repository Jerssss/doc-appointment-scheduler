<?php
require __DIR__ . '/../vendor/autoload.php';
header("Content-Type: application/json");

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointments = $client->MediKo->appointments;

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input['patient_id'] || !$input['doctor_id']) {
        echo json_encode(["error" => "Missing parameters"]);
        exit;
    }

    $result = $appointments->deleteOne([
        'patient_id' => new MongoDB\BSON\ObjectId($input['patient_id']),
        'doctor_id'  => new MongoDB\BSON\ObjectId($input['doctor_id'])
    ]);

    echo json_encode(["success" => $result->getDeletedCount() > 0]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
