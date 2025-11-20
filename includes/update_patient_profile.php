<?php
require __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(['success' => false, 'msg' => 'Invalid JSON']);
        exit;
    }

    $userId = $data['user_id'] ?? null;
    if (!$userId) {
        echo json_encode(['success' => false, 'msg' => 'user_id is required']);
        exit;
    }

    try {
        $userObjId = new ObjectId($userId);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'msg' => 'Invalid user_id format']);
        exit;
    }

    $client = new Client('mongodb://localhost:27017/');
    $users = $client->MediKo->users;

    $set = [];

    if (isset($data['email'])) {
        $set['user_email'] = trim($data['email']);
    }
    if (isset($data['phone'])) {
        $set['contact_info.phone'] = trim($data['phone']);
    }
    if (isset($data['address'])) {
        $set['personal_info.address'] = trim($data['address']);
    }
    if (isset($data['emergency_name'])) {
        $set['emergency_contact.name'] = trim($data['emergency_name']);
    }
    if (isset($data['emergency_relationship'])) {
        $set['emergency_contact.relationship'] = trim($data['emergency_relationship']);
    }
    if (isset($data['emergency_phone'])) {
        $set['emergency_contact.phone'] = trim($data['emergency_phone']);
    }

    if (!$set) {
        echo json_encode(['success' => false, 'msg' => 'No fields to update']);
        exit;
    }

    $result = $users->updateOne(
        ['user_id' => $userObjId],
        ['$set' => $set]
    );

    if ($result->getMatchedCount() === 0) {
        echo json_encode(['success' => false, 'msg' => 'User not found']);
        exit;
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
}
