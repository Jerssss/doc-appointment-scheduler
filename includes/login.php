<?php
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

require '../vendor/autoload.php'; // adjust path if needed

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db = $client->MediKo;
    $users = $db->users;
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}

// Read JSON or POST
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST;
}

$email = $data["email"] ?? '';
$password = $data["password"] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password required"]);
    exit;
}

// Find user
$user = $users->findOne(["user_email" => $email]);
if (!$user) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

// Plaintext password check
if (!isset($user['password']) || $password !== $user['password']) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user" => [
        // Added user_id field so it actually stores user id in session storage
        "user_id" => (string)$user["user_id"], // Converts to string because it is an object in the DB
        "username" => $user["user_name"],
        "email" => $user["user_email"],
        "role" => $user["role"],
        "profile_image" => $user["profile_image"] ?? null,
        'full_name' => $user['personal_info']['full_name'] ?? ''
    ]
]);
?>
