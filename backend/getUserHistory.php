<?php

require_once 'config.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
$response = ['success' => false, 'message' => ''];

// Get the user's ID from the query string
$userId = $_GET['userId'] ?? null;

if (!$userId) {
    $response['message'] = "User ID is required.";
    echo json_encode($response);
    exit();
}

if ($conn->connect_error) {
    $response['message'] = "Database Connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

try {
    // Find all submissions where the StudentID OR StaffID matches the user's ID
    $sql = "
        SELECT 
            s.SubmissionID, 
            s.Date, 
            s.Status,
            t.Tname AS TopicName
        FROM submission s
        JOIN topic t ON s.TopicID = t.TopicID
        WHERE s.StudentID = ? OR s.StaffID = ?
        ORDER BY s.SubmissionID DESC
    ";

    $stmt = $conn->prepare($sql);
    // Bind the same $userId to both parameters
    $stmt->bind_param("ss", $userId, $userId); 
    
    $stmt->execute();
    $result = $stmt->get_result();

    $submissions = [];
    while ($row = $result->fetch_assoc()) {
        $submissions[] = $row;
    }
    
    $response['success'] = true;
    $response['submissions'] = $submissions;
    $stmt->close();

} catch (Exception $e) {
    $response['message'] = "Database error: " . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>