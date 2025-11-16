<?php
require __DIR__ . '/vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);

    // Required fields
    if (!isset($data['user_id'], $data['user_name'], $data['user_email'], $data['role'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
    exit;
}

    // Convert user_id string → ObjectId
    try {
        $objectId = new ObjectId($data['user_id']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid user ID format.']);
        exit;
    }

    // Connect to Mongo
    $client = new Client("mongodb://localhost:27017/");
    $users = $client->MediKo->users;

    // Update user fields (only basic fields for now)
    $updateResult = $users->updateOne(
    ['user_id' => $objectId],
    ['$set' => [
        'username' => $data['user_name'],
        'email' => $data['user_email'],
        'role' => $data['role']
    ]]
);

    if ($updateResult->getModifiedCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'User updated successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes were made or user not found.']);
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}
?>
