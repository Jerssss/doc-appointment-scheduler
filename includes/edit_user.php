<?php
require 'vendor/autoload.php'; // Composer's autoload

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['user_id'], $data['user_name'], $data['user_email'], $data['role'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
        exit;
    }

    // Connect to MongoDB
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $db = $client->MediKo; // your database
    $users = $db->users;   // your collection

    // Update user
    $updateResult = $users->updateOne(
        ['user_id' => $data['user_id']], // filter
        ['$set' => [
            'user_name' => $data['user_name'],
            'user_email' => $data['user_email'],
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
