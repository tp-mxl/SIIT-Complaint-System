<?php
// backend/getQuestionsByTopic.php
require_once 'config.php';
$response = ['success' => false, 'message' => ''];

// Set CORS headers for React access
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check for TopicID parameter
if (!isset($_GET['topicId']) || !is_numeric($_GET['topicId'])) {
    $response['message'] = "Invalid or missing TopicID.";
    echo json_encode($response);
    exit;
}

$topicId = (int)$_GET['topicId'];

// SQL Query to get all questions related to the TopicID
$sql = "SELECT QID, QText FROM question WHERE TopicID = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    $response['message'] = "SQL Prepare failed: " . $conn->error;
    echo json_encode($response);
    exit;
}

$stmt->bind_param("i", $topicId);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    $response['success'] = true;
    $response['questions'] = $questions;
} else {
    $response['message'] = "Error executing query: " . $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>