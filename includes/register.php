<?php
header("Content-Type: application/json");
require 'db.php';

// Decode JSON payload
$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"];
$contactNumber = $data["contactNumber"];
$email = $data["email"];
$address = $data["address"];
$password = $data["password"]; // JS already validated password match

// Check duplicate email
$existing = $users->findOne(["email" => $email]);
if ($existing) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    exit;
}

// Insert new user into MongoDB
$users->insertOne([
    "username" => $username,
    "contactNumber" => $contactNumber,
    "email" => $email,
    "address" => $address,
    "password" => $password
]);

echo json_encode([
    "success" => true,
    "message" => "Registration successful"
]);
?>
