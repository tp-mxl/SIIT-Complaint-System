import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from './AuthHeader'; 

const AdminResponseSheet = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
        const fetchSubmissions = async () => {
            try {
                const response = await fetch('http://localhost/siit-complaint-system/backend/getAdminSubmissions.php');
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
    }, []);

    // Function to handle deletion
    const handleDelete = async (submissionId) => {
        if (!window.confirm(`Are you sure you want to delete submission #${submissionId}? This action cannot be undone.`)) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('submissionId', submissionId);

            const response = await fetch('http://localhost/siit-complaint-system/backend/deleteSubmission.php', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert('Submission deleted successfully.');
                setSubmissions(prevSubmissions => 
                    prevSubmissions.filter(s => s.SubmissionID !== submissionId)
                );
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('A network error occurred. Failed to delete submission.');
        }
    };

    return (
        <div className="min-h-screen bg-siit-light font-sans">
            
            {/* --- Header --- */}
            <AuthHeader /> 

            {/* --- Main Content --- */}
            <main className="flex-grow p-8">
                <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
                    <h1 className="text-4xl font-extrabold text-siit-purple mb-4 border-b pb-2">
                        Manage Complaints
                    </h1>
                    <p className="text-gray-600 mb-6">
                        View all submitted complaints, see submitter details, and update status or respond.
                    </p>
                    
                    <button 
                        onClick={() => navigate('/admin')} 
                        className="text-siit-purple hover:underline mb-4 block"
                    >
                        &larr; Back to Admin Dashboard
                    </button>

                    {/* Loading, Error, and Empty States */}
                    {loading ? (
                        <div className="text-center p-8">
                            <p className="text-lg text-gray-600">Loading submissions...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
                            Error: {error}
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-300">
                            No complaints have been submitted yet.
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
                                        <th className="px-4 py-3">Submitter</th> 
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
                                            
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {submission.SubmitterName}
                                                <span className="text-xs text-gray-500 ml-2">({submission.SubmitterRole})</span>
                                            </td>
                                            
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(submission.Status)}`}>
                                                    {submission.Status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button 
                                                    onClick={() => navigate(`/admin/respond/${submission.SubmissionID}`)}
                                                    className="bg-siit-purple text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors"
                                                >
                                                    Update
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(submission.SubmissionID)}
                                                    className="ml-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
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

export default AdminResponseSheet;