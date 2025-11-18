
<?php
// Used for getting the patient ID to be placed in bookings
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->MediKo->users;

    $email = $_GET['email'] ?? null;

    if (!$email) {
        echo json_encode(["error" => "email is required"]);
        exit;
    }

    // Find user by email
    $user = $usersCollection->findOne(['user_email' => $email]);

    if (!$user) {
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    $personalInfo = $user['personal_info'] ?? [];

    $out = [
        "user_id"    => (string)$user['user_id'],
        "user_name"  => $user['user_name'] ?? '',
        "user_email" => $user['user_email'] ?? '',
        "role"       => $user['role'] ?? '',
        "profile_image" => $user['profile_image'] ?? 'images/default-patient.png',

        // Personal info
        "full_name"      => $personalInfo['full_name'] ?? '',
        "date_of_birth"  => $personalInfo['date_of_birth'] ?? '',
        "sex"            => $personalInfo['sex'] ?? '',
        "address"        => $personalInfo['address'] ?? '',

        // Contact info
        "phone"          => $user['contact_info']['phone'] ?? '',

        // Emergency contact
        "emergency_name"         => $user['emergency_contact']['name'] ?? '',
        "emergency_relationship" => $user['emergency_contact']['relationship'] ?? '',
        "emergency_phone"        => $user['emergency_contact']['phone'] ?? '',

        "account_created" => $user['security']['account_created'] ?? ''
    ];

    // Calculate age from date of birth
    if (!empty($personalInfo['date_of_birth'])) {
        $dob = new DateTime($personalInfo['date_of_birth']);
        $now = new DateTime();
        $age = $now->diff($dob)->y;
        $out['age'] = $age;
    }

    echo json_encode($out);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>

