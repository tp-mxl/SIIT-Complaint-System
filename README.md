# 📢 SIIT Complaint System

A web-based complaint tracking and management system designed for SIIT students and administrators. This application allows students to file complaints or suggestions and track their status, while administrators can review, update, and resolve issues efficiently.

🚀 Features

📊 Overall
- User signup and login with hashed passwords
- The complaint form dynamically generates questions based on the selected topic.
-  public, anonymized view shows the status of all non-sensitive complaints (hides "Academics" and "Abuse" topics).
- An SQL trigger automatically creates an audit log in a `status_log` table every time a complaint's status is changed, tracking the old and new values.

🎓 For Students
- Secure Authentication: Sign up and log in using Student ID.
- File Complaints: Submit complaints with categories, details, and file attachments.
- Track Status: View the history and live status of submitted complaints (Pending, In Progress, Resolved).
- Anonymous View: View a public list of complaints without revealing personal identities.

🛡️ For Administrators
- Dashboard: Overview of all incoming complaints.
- Management: Update complaint status and provide official resolutions.
- Data Visualization: View summary statistics of issues.

🛠️ Tech Stack

Frontend:
- React.js (v18)
- Tailwind CSS (Styling)
- React Router (Navigation)

Backend:
- PHP (Vanilla)
- MySQL (Database)
- Apache Server (via MAMP)

⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- Node.js & npm (For the React frontend)
- MAMP (or XAMPP/WAMP) for the PHP/MySQL server.

📦 Installation & Setup

1. Database Setup (MySQL)
	1. Open MAMP and start the servers.
	2. Go to phpMyAdmin (http://localhost/phpMyAdmin).
	3. Create a new database named `projectsiit`.
	4. Import the `projectsiit.sql` file provided in the database/ folder of this repo.
		Note: This sets up the tables for Students, Admins, Submissions, etc.

2. Backend Setup (PHP)
	1. Locate your MAMP document root (usually C:\MAMP\htdocs on Windows or 		/Applications/MAMP/htdocs on Mac).
	2. Create a folder named siit-complaint-system.
	3. Copy the backend folder from this project into that folder.
		- The path should look like: htdocs/siit-complaint-system/backend/
	4. Open backend/config.php and check your database credentials:
		define('DB_SERVER', 'localhost');
		define('DB_USERNAME', 'root');
		define('DB_PASSWORD', 'root'); // Default MAMP password
		define('DB_NAME', 'projectsiit');
	5. Inside the `backend/` directory, create two new, empty folders (if not exist):
    		`backend/uploads`
    		`backend/resolutions`
    		(The PHP scripts need these folders to exist to save files).

3. Frontend Setup (React)
	1. Open a terminal and navigate to the frontend folder.
		* **(macOS):** `cd /Applications/MAMP/htdocs/siit-complaint-system/frontend`
   		* **(Windows):** `cd C:\MAMP\htdocs\siit-complaint-system\frontend`
	2. Install all the required Node.js packages:
		npm install
	3. Start the React development server:
		npm start
	4. The app should open automatically at http://localhost:3000.

Your computer is now running both servers:
	* **Backend API:** `http://localhost/siit-complaint-system/backend/` (or `http://localhost:8888/siit-complaint-system/backend/` if using MAMP's default port)
	* **Frontend App:** `http://localhost:3000`

🔑 Default Credentials

To log in as an administrator, you must first ensure your `admin` table has a user with a **hashed password**.

1.  Use the `backend/hash_password.php` tool to generate a hash for a password (e.g., `password123`).
2.  Copy the resulting hash.
3.  Go to phpMyAdmin, open the `admin` table, and paste the hash into the `Password` column for your admin user.

You can now log in with that user's `AdminID` and the plain-text password you hashed.

📂 Project Structure

siit-complaint-system/
├── backend/              # PHP API files
│   ├── config.php        # Database connection & CORS
│   ├── authenticate.php  # Login logic
│   ├── signup.php        # Registration logic
│   └── uploads/          # Stored images/attachments
├── frontend/             # React Application
│   ├── public/
│   └── src/
│       ├── components/   # Reusable components & Full page views 
│       └── contexts.js   # Auth state management
└── database/
    └── projectsiit.sql   		# SQL export file
    └── populate_10m_students.sql   	# SQL scalability stress test script

🐛 Troubleshooting
"Network Error" or 500 Error?
	Ensure MAMP is running.
	Check if the backend path is correct: http://localhost/siit-complaint-system/backend/.
	Verify config.php credentials match your MAMP MySQL settings.

CORS Issues?
	Ensure config.php includes the Access-Control-Allow-Origin headers pointing to http://localhost:3000.

⚡ Scalability & Performance Testing
This architecture is designed to handle enterprise-level data loads. To demonstrate the system's robustness, I have included a stress-test script capable of populating the database with 10 Million records.

Stress Test Script: database/populate_10m_students.sql

How to Run the Stress Test:
	1. Import the populate_10m_students.sql file into your MySQL database.
	2. Run the following SQL command:
		CALL sp_GenerateStudents();
	3. Note: Execution time depends on hardware performance (approx. 10-15 mins on standard MAMP setup).
