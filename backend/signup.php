<?php
// backend/signup.php
require_once 'config.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $response['message'] = "Invalid request method.";
    echo json_encode($response);
    exit;
}

// Get POST data
$userId = $_POST['userId'] ?? null;
$password = $_POST['password'] ?? null;
$studentName = $_POST['studentName'] ?? null;
$year = $_POST['year'] ?? null;
$department = $_POST['department'] ?? null;

if (!$userId || !$password || !$studentName || !$year || !$department) {
    $response['message'] = "All fields are required.";
    echo json_encode($response);
    exit;
}

// Check if user ID already exists (Your requirement)
$stmt_check = $conn->prepare("SELECT StudentID FROM student WHERE StudentID = ?");
$stmt_check->bind_param("s", $userId);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows > 0) {
    $response['message'] = "This Student ID is already registered.";
    $stmt_check->close();
    echo json_encode($response);
    exit;
}
$stmt_check->close();

// (Security Fix) Hash the password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert new student
$sql = "INSERT INTO student (StudentID, Password, StudentName, Year, Department) VALUES (?, ?, ?, ?, ?)";
$stmt_insert = $conn->prepare($sql);
$stmt_insert->bind_param("sssss", $userId, $password_hash, $studentName, $year, $department);

if ($stmt_insert->execute()) {
    $response['success'] = true;
    $response['message'] = "Signup successful! You can now log in.";
} else {
    $response['message'] = "Signup failed: " . $stmt_insert->error;
}

$stmt_insert->close();
$conn->close();
echo json_encode($response);
?>