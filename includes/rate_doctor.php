<?php
require __DIR__ . '/../vendor/autoload.php';
header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$doctorId = $input['doctor_id'] ?? null;
$rating = intval($input['rating'] ?? 0);

// Validate input
if (!$doctorId || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'msg' => 'Invalid input']);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");
    $usersCol = $client->MediKo->users;

    // Convert doctor_id string to ObjectId
    $doctorObjectId = new MongoDB\BSON\ObjectId($doctorId);

    // Find doctor
    $doctor = $usersCol->findOne(['_id' => $doctorObjectId]);
    if (!$doctor) {
        echo json_encode(['success' => false, 'msg' => 'Doctor not found']);
        exit;
    }

    // Existing rating and reviews
    $oldRating = floatval($doctor['personal_info']['rating'] ?? 0);
    $oldReviews = intval($doctor['personal_info']['reviews'] ?? 0);

    // Calculate new average
    $newReviews = $oldReviews + 1;
    $newAverage = round((($oldRating * $oldReviews) + $rating) / $newReviews, 1);

    // Update doctor directly (no array, numeric fields)
    $usersCol->updateOne(
        ['_id' => $doctorObjectId],
        ['$set' => [
            'personal_info.rating' => $newAverage,
            'personal_info.reviews' => $newReviews
        ]]
    );

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
}
