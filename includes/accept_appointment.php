<?php
require __DIR__ . '/../vendor/autoload.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$appointmentId = $data["appointment_id"] ?? null;

if (!$appointmentId) {
    echo json_encode(["error" => "Missing appointment_id"]);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointments = $client->MediKo->appointments;

    $apptObjId = new MongoDB\BSON\ObjectId($appointmentId);
    $appt = $appointments->findOne(['_id' => $apptObjId]);

    if (!$appt) {
        echo json_encode(["error" => "Appointment not found"]);
        exit;
    }

    if (($appt["status"] ?? "pending") !== "pending") {
        echo json_encode(["error" => "Appointment already processed"]);
        exit;
    }

    $appointments->updateOne(
        ['_id' => $apptObjId],
        ['$set' => [
            "status" => "in_progress",
            "accepted_at" => new MongoDB\BSON\UTCDateTime()
        ]]
    );

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
