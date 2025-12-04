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

// Get Data ---
$topicId = $_POST['TopicID'] ?? null;
$userId = $_POST['userId'] ?? null; // This is AdminID, StudentID, or StaffID
$userRole = $_POST['userRole'] ?? null; // 'Student', 'Staff', or 'Admin'
$answersJson = $_POST['answers'] ?? null;

if (!$topicId || !$userId || !$userRole || !$answersJson) {
    $response['message'] = 'Missing required fields (Topic, User, or Answers).';
    echo json_encode($response);
    exit();
}

try {
    $answers = json_decode($answersJson, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid answers format.");
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    echo json_encode($response);
    exit();
}

// Database Transaction ---
$conn->begin_transaction();

try {
    // Determine Submitter ID ---
    $studentId = null;
    $staffId = null;
    
    if ($userRole === 'Student') {
        $studentId = $userId;
    } elseif ($userRole === 'Staff') {
        $staffId = $userId;
    } elseif ($userRole === 'Admin') {
        
        $stmt_admin = $conn->prepare("SELECT StaffID, StudentID FROM admin WHERE AdminID = ?");
        $stmt_admin->bind_param("s", $userId); // $userId is the AdminID
        $stmt_admin->execute();
        $result_admin = $stmt_admin->get_result();
        
        if ($result_admin->num_rows > 0) {
            $admin_row = $result_admin->fetch_assoc();
            
            // Check if they are a student-admin
            if ($admin_row['StudentID'] !== null) {
                $studentId = $admin_row['StudentID'];
            } 
            // Check if they are a staff-admin
            elseif ($admin_row['StaffID'] !== null) {
                $staffId = $admin_row['StaffID'];
            }

        } else {
            throw new Exception("Admin user (ID: $userId) not found in admin table.");
        }
        $stmt_admin->close();
    
    } else {
        throw new Exception("Invalid user role: $userRole");
    }

    // Insert into submission table ---
    $status = "Pending";
    $date = date("Y-m-d");

    $sql_sub = "INSERT INTO submission (TopicID, StudentID, StaffID, Date, Status) VALUES (?, ?, ?, ?, ?)";
    $stmt_sub = $conn->prepare($sql_sub);
    $stmt_sub->bind_param("issss", $topicId, $studentId, $staffId, $date, $status);
    
    if (!$stmt_sub->execute()) {
        throw new Exception("Submission insert failed: " . $stmt_sub->error);
    }
    
    $submissionID = $conn->insert_id;
    $stmt_sub->close();

    // Loop and Insert Answers ---
    $sql_ans = "INSERT INTO useranswer (SubmissionID, QID, AnswerText) VALUES (?, ?, ?)";
    $stmt_ans = $conn->prepare($sql_ans);

    foreach ($answers as $answer) {
        $qid = $answer['qid'];
        $answerText = $answer['text'];

        if ($answer['isFile']) {
            $fileKey = "file-" . $qid;
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                
                $uploadDir = 'uploads/'; 
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $fileName = $submissionID . "_" . $qid . "_" . basename($_FILES[$fileKey]["name"]);
                $targetFile = $uploadDir . $fileName;

                if (move_uploaded_file($_FILES[$fileKey]["tmp_name"], $targetFile)) {
                    $answerText = $fileName;
                } else {
                    $answerText = "File upload failed.";
                }
            } else {
                $answerText = ""; 
            }
        }
        
        $stmt_ans->bind_param("iis", $submissionID, $qid, $answerText);
        if (!$stmt_ans->execute()) {
            throw new Exception("Answer insert failed for QID " . $qid . ": " . $stmt_ans->error);
        }
    }
    $stmt_ans->close();
    
    // Commit and Send Response ---
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Submission successful.';
    $response['submissionId'] = $submissionID; 

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>