<?php
// update_doctor_profile.php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['user_id'])) {
        echo json_encode(["success" => false, "msg" => "User ID is required"]);
        exit;
    }

    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->MediKo->users;

    $userId = new MongoDB\BSON\ObjectId($data['user_id']);

    // Prepare update array
    $updateFields = [];

    $personalInfoFields = ['full_name', 'specialization', 'hospital_name', 'hospital_phone', 'hospital_address', 'clinic_hours', 'fee', 'languages', 'rating', 'reviews', 'services'];
    foreach ($personalInfoFields as $field) {
        if (isset($data[$field])) {
            $updateFields["personal_info.$field"] = $data[$field];
        }
    }

    // Email
    if (isset($data['email'])) $updateFields['user_email'] = $data['email'];

    // Phone (contact_info.phone)
    if (isset($data['contact_info.phone'])) {
        $updateFields['contact_info.phone'] = $data['contact_info.phone'];
    }

    // Execute update
    if (!empty($updateFields)) {
        $result = $usersCollection->updateOne(
            ['user_id' => $userId],
            ['$set' => $updateFields]
        );

        if ($result->getModifiedCount() > 0) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "msg" => "No changes were made."]);
        }
    } else {
        echo json_encode(["success" => false, "msg" => "No valid fields to update."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "msg" => $e->getMessage()]);
}
?>
