<?php
require __DIR__ . '/../vendor/autoload.php'; // MongoDB library


use MongoDB\Client;


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');


try {
    $client = new Client("mongodb://localhost:27017/");
    $collection = $client->MediKo->users;


    $users = $collection->find();
    $userArray = [];


    foreach ($users as $user) {
        $userArray[] = [
            'user_id' => (string)$user['_id'],
            'user_name' => $user['user_name'] ?? '',
            'user_email' => $user['user_email'] ?? '',
            'role' => $user['role'] ?? ''
        ];
    }


    echo json_encode(['status' => 'success', 'data' => $userArray]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
