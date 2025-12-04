import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts.js'; 
import AuthHeader from './AuthHeader'; 

const UserHistory = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Get the logged-in user's ID and details from context
    const { userId } = useContext(AuthContext);

    // Helper function to determine badge color based on status
    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    useEffect(() => {
        // Only fetch if the userId is available
        if (userId) {
            const fetchSubmissions = async () => {
                try {
                    // Call the new script with the user's ID
                    const response = await fetch(`http://localhost/siit-complaint-system/backend/getUserHistory.php?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.success) {
                        setSubmissions(data.submissions);
                        setError(null);
                    } else {
                        setError(data.message || 'API returned an error.');
                    }
                } catch (e) {
                    setError('Failed to connect to server or fetch data.');
                    console.error('Fetch Error:', e);
                } finally {
                    setLoading(false);
                }
            };
            fetchSubmissions();
        } else {
            // No userId, likely still loading context or user is not auth
            setLoading(false);
            setError("You must be logged in to view your history.");
        }
    }, [userId]); // Re-run if userId changes

    return (
        <div className="min-h-screen bg-siit-light font-sans">
            
            <AuthHeader /> 

            <main className="flex-grow p-8">
                <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
                    <h1 className="text-4xl font-extrabold text-siit-purple mb-4 border-b pb-2">
                        My Complaint History
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Here is a list of all complaints you have personally submitted.
                    </p>
                    
                    <button 
                        onClick={() => navigate(-1)} // Goes back to User Menu
                        className="text-siit-purple hover:underline mb-4 block"
                    >
                        &larr; Back to Previous Page
                    </button>

                    {/* --- Loading, Error, and Empty States --- */}
                    {loading ? (
                        <div className="text-center p-8">
                            <p className="text-lg text-gray-600">Loading your submissions...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
                            Error: {error}
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-300">
                            You have not submitted any complaints yet.
                        </div>
                    ) : (
                        // --- Submissions Table ---
                        <div className="overflow-x-auto shadow-md rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Topic</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map(submission => (
                                        <tr key={submission.SubmissionID} className="hover:bg-purple-50 transition duration-150">
                                            <td className="px-4 py-3 text-sm text-gray-800 font-medium">#{submission.SubmissionID}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{submission.Date}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{submission.TopicName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(submission.Status)}`}>
                                                    {submission.Status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button 
                                                    onClick={() => navigate(`/view-detail/${submission.SubmissionID}`)}
                                                    className="text-siit-purple hover:text-purple-700 font-medium transition duration-150"
                                                >
                                                    View Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserHistory;