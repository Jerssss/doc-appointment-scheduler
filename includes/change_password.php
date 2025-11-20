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
    $newPassword = $data['new_password'] ?? '';

    if (!$userId || $newPassword === '') {
        echo json_encode(['success' => false, 'msg' => 'user_id and new_password are required']);
        exit;
    }

    if (strlen($newPassword) < 8) {
        echo json_encode(['success' => false, 'msg' => 'Password must be at least 8 characters']);
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

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);

    $result = $users->updateOne(
        ['user_id' => $userObjId],
        [
            '$set' => ['password_hash' => $hash],
            '$unset' => ['password' => '']
        ]
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
