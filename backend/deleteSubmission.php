<?php

require_once 'config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $response['message'] = "Invalid request method.";
    echo json_encode($response);
    exit;
}

$submissionId = $_POST['submissionId'] ?? null;

if (!$submissionId) {
    $response['message'] = 'Submission ID is required.';
    echo json_encode($response);
    exit();
}

// Start a transaction
$conn->begin_transaction();

try {
    // Delete from useranswer (child table)
    $sql_ans = "DELETE FROM useranswer WHERE SubmissionID = ?";
    $stmt_ans = $conn->prepare($sql_ans);
    $stmt_ans->bind_param("i", $submissionId);
    if (!$stmt_ans->execute()) {
        throw new Exception("Failed to delete answers: " . $stmt_ans->error);
    }
    $stmt_ans->close();

    // Delete from resolution (child table)
    $sql_res = "DELETE FROM resolution WHERE SubmissionID = ?";
    $stmt_res = $conn->prepare($sql_res);
    $stmt_res->bind_param("i", $submissionId);
    if (!$stmt_res->execute()) {
        throw new Exception("Failed to delete resolutions: " . $stmt_res->error);
    }
    $stmt_res->close();

    // Delete from submission (parent table)
    $sql_sub = "DELETE FROM submission WHERE SubmissionID = ?";
    $stmt_sub = $conn->prepare($sql_sub);
    $stmt_sub->bind_param("i", $submissionId);
    if (!$stmt_sub->execute()) {
        throw new Exception("Failed to delete submission: " . $stmt_sub->error);
    }
    $stmt_sub->close();

    // If all deletions were successful, commit the transaction
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Submission deleted successfully.';

} catch (Exception $e) {
    // If any step failed, roll back all changes
    $conn->rollback();
    $response['message'] = "Deletion failed: " . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>