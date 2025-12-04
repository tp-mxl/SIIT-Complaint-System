<?php
// backend/getSubmissionDetails.php
require_once 'config.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
$response = ['success' => false, 'message' => ''];

$submissionId = $_GET['id'] ?? null;

if (!$submissionId) {
    $response['message'] = "Submission ID is required.";
    echo json_encode($response);
    exit();
}

if ($conn->connect_error) {
    $response['message'] = "Database Connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

try {
    // Query 1: Get Main Submission Details
    $sql_details = "
        SELECT 
            s.SubmissionID, s.Date, s.Status,
            t.Tname AS TopicName,
            COALESCE(st.StudentName, sf.StaffName) AS SubmitterName,
            CASE
                WHEN s.StudentID IS NOT NULL THEN 'Student'
                WHEN s.StaffID IS NOT NULL THEN 'Staff'
                ELSE 'Unknown'
            END AS SubmitterRole
        FROM submission s
        JOIN topic t ON s.TopicID = t.TopicID
        LEFT JOIN student st ON s.StudentID = st.StudentID
        LEFT JOIN staff sf ON s.StaffID = sf.StaffID
        WHERE s.SubmissionID = ?
    ";
    $stmt_details = $conn->prepare($sql_details);
    $stmt_details->bind_param("i", $submissionId);
    $stmt_details->execute();
    $result_details = $stmt_details->get_result();
    
    if ($result_details->num_rows === 0) {
        throw new Exception("Submission not found.");
    }
    $details = $result_details->fetch_assoc();
    $stmt_details->close();

    // Query 2: Get all User Answers (Using 'AnswerText' column)
    $sql_answers = "
        SELECT q.QText, ua.AnswerText 
        FROM useranswer ua
        JOIN question q ON ua.QID = q.QID
        WHERE ua.SubmissionID = ?
        ORDER BY q.QID ASC
    ";
    $stmt_answers = $conn->prepare($sql_answers);
    $stmt_answers->bind_param("i", $submissionId);
    $stmt_answers->execute();
    $result_answers = $stmt_answers->get_result();
    $answers = [];
    while ($row = $result_answers->fetch_assoc()) {
        $answers[] = $row;
    }
    $stmt_answers->close();

    // Query 3: Get ONLY the MOST RECENT Admin Resolution

    $sql_res = "
        SELECT 
            r.ResDate, r.ResText, r.AttachmentPath,
            COALESCE(sf.StaffName, a.Role) AS AdminName
        FROM resolution r
        JOIN admin a ON r.AdminID = a.AdminID
        LEFT JOIN staff sf ON a.StaffID = sf.StaffID
        WHERE r.SubmissionID = ?
        ORDER BY r.ResDate DESC
        LIMIT 1
    ";
    $stmt_res = $conn->prepare($sql_res);
    $stmt_res->bind_param("i", $submissionId);
    $stmt_res->execute();
    $result_res = $stmt_res->get_result();
    

    $resolution = $result_res->fetch_assoc(); 
    $stmt_res->close();

    // --- Bundle and Send Response ---
    $response['success'] = true;
    $response['details'] = $details;
    $response['answers'] = $answers;
    $response['resolution'] = $resolution; 

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>