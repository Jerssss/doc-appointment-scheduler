<?php
require __DIR__ . '/../vendor/autoload.php';
use MongoDB\Client;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User ID is required.']);
        exit;
    }

    $client = new Client("mongodb://localhost:27017/");
    $collection = $client->MediKo->users;

    $result = $collection->deleteOne(['user_id' => new MongoDB\BSON\ObjectId($data['user_id'])]);

    if ($result->getDeletedCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'User deleted successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'User not found or already deleted.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
