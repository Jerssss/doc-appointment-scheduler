<?php
header("Content-Type: application/json");
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];

// Find user
$user = $users->findOne(["email" => $email]);

if (!$user) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

// Plaintext check (since your dummy data is plaintext)
if ($password !== $user["password"]) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user" => [
        "username" => $user["username"],
        "email" => $user["email"]
    ]
]);
?>
