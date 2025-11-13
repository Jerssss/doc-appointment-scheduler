<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $client->MediKo->patientdetails;

    $patients = $collection->find()->toArray();
    $result = [];

    foreach ($patients as $patient) {
        $result[] = [
            '_id' => $patient['_id']->__toString(),
            'name' => "Patient " . $patient['_id']->__toString(),
            'image' => $patient['image'] ?? null
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);

} catch(Exception $e){
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}
