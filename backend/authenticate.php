<?php

require_once 'config.php';
session_start();
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

$response = ['success' => false, 'message' => '', 'role' => '', 'userId' => '', 'name' => ''];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $response['message'] = "Invalid request method.";
    echo json_encode($response);
    exit;
}

$userId = $_POST['userId'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($userId) || empty($password)) {
    $response['message'] = 'User ID and password are required.';
    echo json_encode($response);
    exit;
}

try {
    
    // --- STEP 1: Check Admin Table FIRST ---
    $sql_admin = "SELECT 
                    a.AdminID,
                    a.Password,
                    COALESCE(s.StaffName, st.StudentName, 'SuperAdmin') AS AdminName
                  FROM admin a
                  LEFT JOIN staff s ON a.StaffID = s.StaffID
                  LEFT JOIN student st ON a.StudentID = st.StudentID
                  WHERE a.AdminID = ?";
    
    $stmt = $conn->prepare($sql_admin);
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();
        if (password_verify($password, $admin['Password'])) {
            $response['success'] = true;
            $response['role'] = 'Admin';
            $response['userId'] = $admin['AdminID'];
            $response['name'] = $admin['AdminName'];
        } else {
            $response['message'] = 'Invalid Admin ID or password.';
        }
    } else {
        // --- STEP 2: Check Staff Table SECOND ---
        $stmt = $conn->prepare("SELECT StaffID, Password, StaffName FROM staff WHERE StaffID = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $staff = $result->fetch_assoc();
            if (password_verify($password, $staff['Password'])) {
                $response['success'] = true;
                $response['role'] = 'Staff';
                $response['userId'] = $staff['StaffID'];
                $response['name'] = $staff['StaffName'];
            } else {
                $response['message'] = 'Invalid Staff ID or password.';
            }
        } else {
            // --- STEP 3: Check Student Table LAST ---
            $stmt = $conn->prepare("SELECT StudentID, Password, StudentName FROM student WHERE StudentID = ?");
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $student = $result->fetch_assoc();
                if (password_verify($password, $student['Password'])) {
                    $response['success'] = true;
                    $response['role'] = 'Student';
                    $response['userId'] = $student['StudentID'];
                    $response['name'] = $student['StudentName'];
                } else {
                    $response['message'] = 'Invalid Student ID or password.';
                }
            } else {
                $response['message'] = 'User ID not found in any record.';
            }
        }
    }

    $stmt->close();
    
} catch (Exception $e) {
    $response['message'] = "A database error occurred: " . $e->getMessage();
}

$conn->close();
echo json_encode($response);
?>