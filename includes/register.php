<?php
header("Content-Type: application/json");
require 'db.php'; // your MongoDB connection file

// Decode JSON payload
$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"] ?? '';
$email = $data["email"] ?? '';
$password = $data["password"] ?? '';
$full_name = $data["full_name"] ?? '';
$date_of_birth = $data["date_of_birth"] ?? '';
$sex = $data["sex"] ?? '';
$address = $data["address"] ?? '';
$phone = $data["phone"] ?? '';
$emergency_name = $data["emergency_name"] ?? '';
$emergency_relationship = $data["emergency_relationship"] ?? '';
$emergency_phone = $data["emergency_phone"] ?? '';

// Validate required fields
if (!$username || !$email || !$password || !$full_name || !$date_of_birth || !$sex || !$address || !$phone) {
    echo json_encode(["success" => false, "message" => "All required fields must be filled"]);
    exit;
}

// Check duplicate email
$existing = $users->findOne(["user_email" => $email]);
if ($existing) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    exit;
}

// Insert new patient
$users->insertOne([
    "user_name" => $username,
    "user_email" => $email,
    "role" => "patient",
    "profile_image" => "images/default-patient.png",
    "password" => $password,
    "personal_info" => [
        "full_name" => $full_name,
        "date_of_birth" => $date_of_birth,
        "sex" => $sex,
        "address" => $address
    ],
    "contact_info" => [
        "phone" => $phone
    ],
    "emergency_contact" => [
        "name" => $emergency_name,
        "relationship" => $emergency_relationship,
        "phone" => $emergency_phone
    ],
    "security" => [
        "account_created" => date("c")
    ]
]);

echo json_encode([
    "success" => true,
    "message" => "Patient registration successful"
]);
?>
