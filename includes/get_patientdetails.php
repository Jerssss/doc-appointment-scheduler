<?php
require __DIR__ . '/../vendor/autoload.php';

if(!isset($_GET['id']) || empty($_GET['id'])){
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No patient ID']);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $client->MediKo->patientdetails;

    $id = $_GET['id'];
    $patient = $collection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);

    if(!$patient){
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Patient not found']);
        exit;
    }

    $data = [
        'past_conditions' => $patient['past_medical_conditions'] ?? [],
        'past_surgeries' => $patient['past_surgeries'] ?? [],
        'current_conditions' => $patient['current_medical_conditions'] ?? [$patient['illness'] ?? 'N/A'],
        'last_appointment' => isset($patient['last_appointment_date']) ? date('Y-m-d', $patient['last_appointment_date']->toDateTime()->getTimestamp()) : 'N/A'
    ];

    header('Content-Type: application/json');
    echo json_encode($data);

} catch(Exception $e){
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
