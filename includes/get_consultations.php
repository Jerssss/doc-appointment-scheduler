<?php
session_start();
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $appointmentsCol = $client->MediKo->appointments;
    $consultationsCol = $client->MediKo->consultation;
    $usersCol = $client->MediKo->users;

    // Get logged-in user id
    // Example: $_SESSION['user_id'] contains the patient's ObjectId string
    $userId = $_SESSION['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(['error' => 'User not logged in']);
        exit;
    }

    $userObjId = new MongoDB\BSON\ObjectId($userId);

    // Fetch all appointments for this patient
    $cursor = $appointmentsCol->find([
        'patient_id' => $userObjId
    ], [
        'sort' => ['time' => 1]
    ]);

    $result = [];

    foreach ($cursor as $appt) {
        $apptId = $appt['_id'];

        // Get doctor info
        $doctor = $usersCol->findOne(['_id' => $appt['doctor_id']]);
        $doctorName = $doctor['personal_info']['full_name'] ?? $doctor['user_name'] ?? 'Unknown';
        $doctorImg = $doctor['personal_info']['profile_image'] ?? 'images/default-doctor.png';

        // Get ratings
        $ratings = $doctor['ratings'] ?? []; // assume doctor document has 'ratings' array of numbers
        $avgRating = !empty($ratings) ? round(array_sum($ratings)/count($ratings), 1) : 'N/A';

        // Find related consultation
        $consult = $consultationsCol->findOne([
            'appointment_id' => $apptId
        ]);

        $diagnosis = $consult['diagnosis'] ?? '';
        $prescription = $consult['prescription'] ?? '';
        $followUp = null;
        if (!empty($consult['follow_up_date']) && $consult['follow_up_date'] instanceof MongoDB\BSON\UTCDateTime) {
            $followUp = $consult['follow_up_date']->toDateTime()->format('Y-m-d H:i:s');
        }

        // Convert time
        $apptTime = $appt['time'] instanceof MongoDB\BSON\UTCDateTime 
                    ? $appt['time']->toDateTime()->format('Y-m-d H:i:s') 
                    : null;

        $result[] = [
            'appointment_id' => (string)$apptId,
            'doctor_name' => $doctorName,
            'doctor_img' => $doctorImg,
            'doctor_rating' => $avgRating,
            'mode' => $appt['mode'] ?? 'N/A',
            'status' => $appt['status'] ?? 'pending',
            'time' => $apptTime,
            'notes' => $appt['notes'] ?? '',
            'diagnosis' => $diagnosis,
            'prescription' => $prescription,
            'follow_up' => $followUp
        ];
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
