<?php
require __DIR__ . '/../vendor/autoload.php';
header("Content-Type: application/json");


$data = json_decode(file_get_contents("php://input"), true);


$patientId = $data["patient_id"] ?? null;
$doctorId = $data["doctor_id"] ?? null;


if (!$patientId || !$doctorId) {
    echo json_encode(["error" => "Missing patient_id or doctor_id"]);
    exit;
}


try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointments = $client->MediKo->appointments;


    $patientObjId = new MongoDB\BSON\ObjectId($patientId);
    $doctorObjId = new MongoDB\BSON\ObjectId($doctorId);


    // Find the correct appointment
    $appt = $appointments->findOne([
        "patient_id" => $patientObjId,
        "doctor_id" => $doctorObjId
    ]);


    if (!$appt) {
        echo json_encode(["error" => "Appointment not found"]);
        exit;
    }


    // Only allow pending → in_progress
    if (($appt["status"] ?? "pending") !== "pending") {
        echo json_encode(["error" => "Appointment already processed"]);
        exit;
    }


    $result = $appointments->updateOne(
        [
            "patient_id" => $patientObjId,
            "doctor_id" => $doctorObjId
        ],
        [
            '$set' => [
                "status" => "in_progress",
                "accepted_at" => new MongoDB\BSON\UTCDateTime()
            ]
        ]
    );


    echo json_encode(["success" => true]);


} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
