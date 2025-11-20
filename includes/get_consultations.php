<?php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $appointmentsCol = $client->MediKo->appointments;
    $consultationsCol = $client->MediKo->consultation;
    $usersCol = $client->MediKo->users;

    // GET user ID from frontend (sessionStorage)
    $userId = $_GET['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(['error' => 'Missing user_id']);
        exit;
    }

    // Try to convert user ID to ObjectId, fallback to string
    try {
        $userObjId = new MongoDB\BSON\ObjectId($userId);
        $patientQuery = ['$or' => [['patient_id' => $userObjId], ['patient_id' => $userId]]];
    } catch (Exception $e) {
        $patientQuery = ['patient_id' => $userId];
    }

    // Fetch all appointments of this patient
    $cursor = $appointmentsCol->find(
        $patientQuery,
        ['sort' => ['time' => 1]]
    );

    $result = [];

    foreach ($cursor as $appt) {
        $apptId = $appt['_id'];

        // Fetch doctor details (match against user_id field)
        $doctorId = $appt['doctor_id'];
        $doctorQuery = ['$or' => [
            ['user_id' => $doctorId], // match string user_id
            ['user_id' => new MongoDB\BSON\ObjectId($doctorId)] // match ObjectId user_id
        ]];

        $doctor = $usersCol->findOne($doctorQuery);

        $doctorName = $doctor['personal_info']['full_name'] ?? $doctor['user_name'] ?? 'Unknown';
        $doctorImg = $doctor['profile_image'] ?? 'images/default-doctor.png';

        // Doctor rating from personal_info
        $avgRating = $doctor['personal_info']['rating'] ?? 'N/A';

        // Related consultation record
        $consult = $consultationsCol->findOne(['appointment_id' => $apptId]);

        $diagnosis = $consult['diagnosis'] ?? '';
        $prescription = $consult['prescription'] ?? '';
        $followUp = null;

        if (!empty($consult['follow_up_date']) && $consult['follow_up_date'] instanceof MongoDB\BSON\UTCDateTime) {
            $followUp = $consult['follow_up_date']->toDateTime()->format('Y-m-d H:i:s');
        }

        // Appointment time
        $apptTime = $appt['time'] instanceof MongoDB\BSON\UTCDateTime
            ? $appt['time']->toDateTime()->format('Y-m-d H:i:s')
            : null;

        $result[] = [
            'appointment_id' => (string)$apptId,
            'doctor_id' => isset($doctor['_id']) ? (string)$doctor['_id'] : null,
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
