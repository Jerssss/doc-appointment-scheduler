<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $appointmentsCollection = $client->MediKo->appointments;
    $patientsCollection = $client->MediKo->patientdetails;

    $appointments = $appointmentsCollection->find()->toArray();
    $result = [];

    foreach($appointments as $appt){
        // fetch patient details
        $patient = $patientsCollection->findOne(['_id'=>$appt['patient_id']]);

        $result[] = [
            '_id' => $appt['_id'],
            'patient_id' => $appt['patient_id'],
            'patient_name' => $patient['name'] ?? "Patient ".$appt['_id'],
            'age' => $appt['age'] ?? 'N/A',
            'gender' => $appt['gender'] ?? 'N/A',
            'address' => $appt['address'] ?? 'N/A',
            'temperature' => $appt['temperature'] ?? '-',
            'blood_pressure' => $appt['blood_pressure'] ?? '-',
            'heart_rate' => $appt['heart_rate'] ?? '-',
            'height_weight' => $appt['height_weight'] ?? '-',
            'time' => $appt['time'],
            'mode' => $appt['mode'] ?? '-',
            'status' => $appt['status'] ?? '-',
            'notes' => $appt['notes'] ?? ''
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($result);

} catch(Exception $e){
    echo json_encode(['error'=>$e->getMessage()]);
}
