<?php

require_once 'config.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

// Get all data from the form
$submissionId = $_POST['submissionId'] ?? null;
$adminId = $_POST['adminId'] ?? null;
$resText = $_POST['resText'] ?? null;
$status = $_POST['status'] ?? null;
$resDate = date("Y-m-d");

if (!$submissionId || !$adminId || !$resText || !$status) {
    $response['message'] = 'Missing required fields (ID, Admin, Text, or Status).';
    echo json_encode($response);
    exit();
}

$attachmentPath = null;
$uploadDir = 'resolutions/';

// Handle file upload (if one exists)
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $fileName = $submissionId . "_RES_" . basename($_FILES["attachment"]["name"]);
    $targetFile = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES["attachment"]["tmp_name"], $targetFile)) {
        $attachmentPath = $targetFile; // Save the relative path
    } else {
        $response['message'] = "File upload failed.";
        echo json_encode($response);
        exit();
    }
}

// Start Transaction
$conn->begin_transaction();

try {
    // Insert the new resolution
    $sql_res = "INSERT INTO resolution (SubmissionID, AdminID, ResText, ResDate, AttachmentPath) VALUES (?, ?, ?, ?, ?)";
    $stmt_res = $conn->prepare($sql_res);
    $stmt_res->bind_param("issss", $submissionId, $adminId, $resText, $resDate, $attachmentPath);
    
    if (!$stmt_res->execute()) {
        throw new Exception("Resolution insert failed: " . $stmt_res->error);
    }
    $stmt_res->close();

    // Update the submission status
    $sql_sub = "UPDATE submission SET Status = ? WHERE SubmissionID = ?";
    $stmt_sub = $conn->prepare($sql_sub);
    $stmt_sub->bind_param("si", $status, $submissionId);

    if (!$stmt_sub->execute()) {
        throw new Exception("Submission status update failed: " . $stmt_sub->error);
    }
    $stmt_sub->close();

    // Commit
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Response submitted and status updated successfully.';

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = "Transaction failed: " . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>