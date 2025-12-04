<?php

require_once 'config.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
$response = ['success' => false, 'message' => ''];

if ($conn->connect_error) {
    $response['message'] = "Database Connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

// SQL Query to get all details for the admin view
$sql = "
    SELECT 
        s.SubmissionID, 
        s.Date, 
        s.Status,
        t.Tname AS TopicName,
        -- Use COALESCE to get the name from the correct table
        COALESCE(st.StudentName, sf.StaffName) AS SubmitterName,
        -- Determine the role for display
        CASE
            WHEN s.StudentID IS NOT NULL THEN 'Student'
            WHEN s.StaffID IS NOT NULL THEN 'Staff'
            ELSE 'Unknown'
        END AS SubmitterRole
    FROM submission s
    JOIN topic t ON s.TopicID = t.TopicID
    LEFT JOIN student st ON s.StudentID = st.StudentID
    LEFT JOIN staff sf ON s.StaffID = sf.StaffID
    ORDER BY s.SubmissionID DESC
";

$result = $conn->query($sql);

if ($result) {
    $submissions = [];
    while ($row = $result->fetch_assoc()) {
        $submissions[] = $row;
    }
    $response['success'] = true;
    $response['submissions'] = $submissions;
} else {
    $response['message'] = "Error retrieving admin submissions: " . $conn->error;
}

$conn->close();
echo json_encode($response);
?>