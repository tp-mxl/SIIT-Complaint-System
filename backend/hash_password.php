<?php

header('Content-Type: text/html');

// --- Passwords to Hash ---
$password_1 = "password123";
$password_2 = "staff123";
// -------------------------

$hash_1 = password_hash($password_1, PASSWORD_DEFAULT);
$hash_2 = password_hash($password_2, PASSWORD_DEFAULT);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Password Hasher</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: #fff; border: 1px solid #ccc; border-radius: 8px; padding: 20px; max-width: 700px; margin: auto; }
        h3 { border-bottom: 2px solid #6c47ff; padding-bottom: 10px; color: #333; }
        p { margin-bottom: 5px; font-weight: bold; }
        textarea { width: 98%; font-size: 14px; padding: 10px; border-radius: 4px; border: 1px solid #ddd; margin-top: 5px; }
        .hash-block { margin-bottom: 25px; }
    </style>
</head>
<body>
    <div class="container">
        <h3>Password Hasher Tool</h3>
        <p>Copy these hashed strings and paste them into the `Password` column in phpMyAdmin for your admin and staff users.</p>
        
        <div class="hash-block">
            <p>Password: <code><?php echo $password_1; ?></code></p>
            <textarea rows="3" readonly><?php echo $hash_1; ?></textarea>
        </div>
        
        <div class="hash-block">
            <p>Password: <code><?php echo $password_2; ?></code></p>
            <textarea rows="3" readonly><?php echo $hash_2; ?></textarea>
        </div>
    </div>
</body>
</html>