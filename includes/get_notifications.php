<?php
// Prevent warnings from breaking JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

require '../vendor/autoload.php';
header("Content-Type: application/json; charset=UTF-8");

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");

    $appointmentsCollection = $client->MediKo->appointments;
    $usersCollection        = $client->MediKo->users;
    $paymentsCollection     = $client->MediKo->payments; // ✅ added

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['patient_id'])) {
        echo json_encode(["success" => false, "error" => "No patient_id provided"]);
        exit;
    }

    $patientId = $input['patient_id'];

    // Ensure ObjectId
    if (is_array($patientId) && isset($patientId['$oid'])) {
        $patientId = new MongoDB\BSON\ObjectId($patientId['$oid']);
    } else {
        $patientId = new MongoDB\BSON\ObjectId($patientId);
    }

    // Fetch all appointments for patient
    $appointments = $appointmentsCollection->find([
        'patient_id' => $patientId
    ]);

    $results = [];

    foreach ($appointments as $app) {

        // ✅ SKIP if already paid
        $paymentExists = $paymentsCollection->findOne([
            'appointment_id' => $app->_id
        ]);

        if ($paymentExists) {
            continue; // ✅ do not show in notifications
        }

        $acceptedAt = isset($app->accepted_at)
            ? $app->accepted_at->toDateTime()->format(DATE_ATOM)
            : null;

        // ✅ Fetch doctor name dynamically
        $doctorName = "TBA";
        if (isset($app->doctor_id)) {
            $doctor = $usersCollection->findOne([
                'user_id' => $app->doctor_id
            ]);
            if ($doctor) {
                $doctorName = $doctor->personal_info->full_name
                    ?? $doctor->user_name
                    ?? "TBA";
            }
        }

        $results[] = [
            "appointment_id" => (string)$app->_id,
            "status"         => $app->status ?? "unknown",
            "mode"           => $app->mode ?? "unknown",
            "notes"          => $app->notes ?? "",
            "time"           => isset($app->time)
                ? $app->time->toDateTime()->format(DATE_ATOM)
                : null,
            "accepted_at"    => $acceptedAt,
            "doctor_name"    => $doctorName,
            "type"           => ($app->status === 'in_progress' || $acceptedAt)
                ? "appointment_accepted"
                : "booking_created",
            "message"        => ($app->status === 'in_progress' || $acceptedAt)
                ? "Your appointment has been accepted. You can now pay."
                : "Your booking has been created."
        ];
    }

    echo json_encode([
        "success" => true,
        "notifications" => $results
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
