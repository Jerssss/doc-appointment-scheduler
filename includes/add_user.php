<?php
require __DIR__ . '/../vendor/autoload.php';
use MongoDB\Client;
use MongoDB\BSON\ObjectId;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    $data = json_decode(file_get_contents("php://input"), true);

    // Required base fields
    if (!isset($data['username'], $data['email'], $data['password'], $data['role'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields.']);
        exit;
    }

    // Connect to Mongo
    $client = new Client("mongodb://localhost:27017/");
    $collection = $client->MediKo->users;

    // Generate new user_id (same format as your example)
    $userId = new ObjectId();

    // Store raw password (optional for display?) and hash
    $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

    // Normalize incoming data to support both flat and nested shapes from callers
    $pi = $data['personal_info'] ?? [];
    $ci = $data['contact_info'] ?? [];
    $ec = $data['emergency_contact'] ?? [];

    // Prefer provided username/email but also store legacy keys for compatibility
    $username = $data['username'] ?? ($data['user_name'] ?? '');
    $email    = $data['email'] ?? ($data['user_email'] ?? '');

    // Build final document format
    $document = [
        "user_id" => $userId,
        // store both variants to satisfy different readers in the codebase
        "username" => $username,
        "user_name" => $username,
        "email" => $email,
        "user_email" => $email,
        "role" => $data["role"],
        "profile_image" => "images/default-patient.png", // default
        "password" => $data["password"], // only if you still want plaintext (NOT recommended)
        "password_hash" => $passwordHash,

        // optional blocks - support both nested and flat payloads
        "personal_info" => [
            "full_name" => ($pi['full_name'] ?? ($data['full_name'] ?? "")),
            "date_of_birth" => ($pi['date_of_birth'] ?? ($data['date_of_birth'] ?? "")),
            "sex" => ($pi['sex'] ?? ($data['sex'] ?? "")),
            "address" => ($pi['address'] ?? ($data['address'] ?? ""))
        ],
        "contact_info" => [
            "phone" => ($ci['phone'] ?? ($data['phone'] ?? ""))
        ],
        "emergency_contact" => [
            "name" => ($ec['name'] ?? ($data['emergency_name'] ?? "")),
            "relationship" => ($ec['relationship'] ?? ($data['emergency_relationship'] ?? "")),
            "phone" => ($ec['phone'] ?? ($data['emergency_phone'] ?? ""))
        ],
        "security" => [
            "account_created" => date("c") // ISO 8601 timestamp
        ]
    ];

    // Insert in DB
    $collection->insertOne($document);

    echo json_encode([
        "status" => "success",
        "message" => "User added successfully!",
        "inserted_id" => (string)$userId
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
