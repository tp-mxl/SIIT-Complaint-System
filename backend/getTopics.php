<?php

require_once 'config.php';
$response = ['success' => false, 'message' => ''];

$sql = "SELECT TopicID, Tname FROM topic";
$result = $conn->query($sql);

if ($result) {
    $topics = [];
    while ($row = $result->fetch_assoc()) {
        $topics[] = $row;
    }
    $response['success'] = true;
    $response['topics'] = $topics;
} else {
    $response['message'] = "Error retrieving topics: " . $conn->error;
}

$conn->close();
header('Content-Type: application/json');
echo json_encode($response);
?>