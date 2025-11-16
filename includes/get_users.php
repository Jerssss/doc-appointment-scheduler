<?php
require __DIR__ . '/../vendor/autoload.php'; // MongoDB PHP library
use MongoDB\Client;

header('Content-Type: application/json');

try {
    // Connect to MongoDB
    $client = new Client("mongodb://localhost:27017/");
    $usersCollection = $client->MediKo->users;

    // Fetch all users
    $cursor = $usersCollection->find();

    $users = [];

    foreach ($cursor as $doc) {
        $users[] = [
            'user_id'    => (string) $doc['_id'],               // always convert to string
            'user_name'  => $doc['user_name'] ?? '',
            'user_email' => $doc['user_email'] ?? '',
            'role'       => $doc['role'] ?? '',
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data'   => $users
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error fetching users: ' . $e->getMessage()
    ]);
}
