<?php
// doctor_profile_data.php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCollection = $client->MediKo->users;

    $email = $_GET['email'] ?? null;

    if (!$email) {
        echo json_encode(["success" => false, "error" => "Email is required"]);
        exit;
    }

    // Fetch doctor by email
    $doctor = $usersCollection->findOne([
        'user_email' => $email,
        'role' => 'doctor'
    ]);

    if (!$doctor) {
        echo json_encode(["success" => false, "error" => "Doctor not found"]);
        exit;
    }

    $personalInfo = $doctor['personal_info'] ?? [];

    $out = [
      "success" => true,
      "doctor" => [
          "user_id"       => (string)$doctor['user_id'],
          "user_name"     => $doctor['user_name'] ?? '',
          "user_email"    => $doctor['user_email'] ?? '',
          "role"          => $doctor['role'] ?? 'doctor',
          "profile_image" => $doctor['profile_image'] ?? 'images/default-doctor.png',
          "personal_info" => [
              "full_name"        => $personalInfo['full_name'] ?? '',
              "specialization"   => $personalInfo['specialization'] ?? '',
              "hospital_name"    => $personalInfo['hospital_name'] ?? '',
              "hospital_phone"   => $personalInfo['hospital_phone'] ?? '',
              "hospital_address" => $personalInfo['hospital_address'] ?? '',
              "clinic_hours"     => $personalInfo['clinic_hours'] ?? '',
              "fee"              => $personalInfo['fee'] ?? '',
              "languages"        => $personalInfo['languages'] ?? '',
              "rating"           => $personalInfo['rating'] ?? '',
              "reviews"          => $personalInfo['reviews'] ?? '',
              "services"         => $personalInfo['services'] ?? ''
          ],
          "contact_info" => [
              "phone" => $doctor['contact_info']['phone'] ?? '—'  // <-- here
          ]
      ]
  ];


    echo json_encode($out);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
