<?php
require __DIR__ . '/../vendor/autoload.php';
session_start();

$client = new MongoDB\Client("mongodb://localhost:27017");
$paymentsCollection = $client->MediKo->payments;
$appointmentsCollection = $client->MediKo->appointments;
$consultationsCollection = $client->MediKo->consultation;

try {
    $appointment_id = $_POST['appointment_id'] ?? null;
    $payment_method = $_POST['payment_method'] ?? null;

    if (!$appointment_id || !$payment_method) {
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $appointment = $appointmentsCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($appointment_id)]);
    if (!$appointment) {
        echo json_encode(['error' => 'Appointment not found']);
        exit;
    }

    // Optional: Get consultation linked to appointment
    $consultation = $consultationsCollection->findOne(['appointment_id' => $appointment['_id']]);

    $gcash_screenshot_path = null;
    if ($payment_method === 'gcash' && isset($_FILES['gcash_screenshot'])) {
        $uploadDir = __DIR__ . '/../images/payments/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $filename = time() . '_' . basename($_FILES['gcash_screenshot']['name']);
        $targetPath = $uploadDir . $filename;
        move_uploaded_file($_FILES['gcash_screenshot']['tmp_name'], $targetPath);

        $gcash_screenshot_path = 'images/payments/' . $filename;
    }

    $paymentsCollection->insertOne([
        'consultation_id' => $consultation['_id'] ?? null,
        'appointment_id' => $appointment['_id'],
        'patient_id' => $appointment['patient_id'],
        'doctor_id' => $appointment['doctor_id'],
        'payment_method' => $payment_method,
        'gcash_screenshot' => $gcash_screenshot_path,
        'amount' => 600.00,
        'timestamp' => new MongoDB\BSON\UTCDateTime(),
        'status' => 'paid'
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
