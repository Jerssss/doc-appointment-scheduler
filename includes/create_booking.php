<?php
require '../vendor/autoload.php';
header("Content-Type: application/json; charset=UTF-8");

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $client->Mediko->appointments;

    $input = json_decode(file_get_contents('php://input'), true);

    // Convert incoming string date → BSON UTC date
    $timestampMs = strtotime($input['time']) * 1000;
    $bsonDate = new MongoDB\BSON\UTCDateTime($timestampMs);

    $appointment = [
        'patient_id' => new MongoDB\BSON\ObjectId($input['patient_id']),
        'doctor_id' => new MongoDB\BSON\ObjectId($input['doctor_id']),

        // MUST BE BSON DATE
        'time' => $bsonDate,

        'mode' => $input['mode'],
        'status' => 'pending',
        'notes' => $input['notes'] ?? '',

        // Patient vitals (optional)
        'age' => $input['age'] ?? null,
        'gender' => $input['gender'] ?? null,
        'address' => $input['address'] ?? null,
        'temperature' => $input['temperature'] ?? null,
        'blood_pressure' => $input['blood_pressure'] ?? null,
        'heart_rate' => $input['heart_rate'] ?? null,
        'height_weight' => $input['height_weight'] ?? null,
    ];

    $result = $collection->insertOne($appointment);

    echo json_encode([
        "success" => true,
        "inserted_id" => (string)$result->getInsertedId()
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
