<?php
require __DIR__ . '/../vendor/autoload.php';
use MongoDB\Client;


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');


try {
    $data = json_decode(file_get_contents("php://input"), true);


    if (!isset($data['user_name'], $data['user_email'], $data['password'], $data['role'])) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }


    $client = new Client("mongodb://localhost:27017/");
    $collection = $client->MediKo->users;


    // Optional: hash password
    $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);


    $insertResult = $collection->insertOne([
        'user_name' => $data['user_name'],
        'user_email' => $data['user_email'],
        'password' => $data['password'],
        'role' => $data['role']
    ]);


    echo json_encode(['status' => 'success', 'message' => 'User added successfully!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
