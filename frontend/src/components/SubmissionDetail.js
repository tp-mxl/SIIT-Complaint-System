import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthHeader from './AuthHeader';

const SubmissionDetail = () => {
    const { submissionID } = useParams();
    const navigate = useNavigate();
    
    const [submission, setSubmission] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [resolution, setResolution] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`http://localhost/siit-complaint-system/backend/getSubmissionDetails.php?id=${submissionID}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setSubmission(data.details);
                    setAnswers(data.answers);
                    setResolution(data.resolution || null); 
                } else {
                    setError(data.message || 'Failed to fetch details.');
                }
            } catch (err) {
                setError('Network error or server unavailable.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [submissionID]);

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

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-siit-light font-sans">
                <AuthHeader /> 
                <div className="p-8 text-center text-lg flex-grow flex items-center justify-center">Loading complaint details...</div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col min-h-screen bg-siit-light font-sans">
                <AuthHeader />
                <div className="p-8 text-center text-lg text-red-600">Error: {error}</div>
            </div>
        );
    }

    if (!submission) {
        return (
             <div className="flex flex-col min-h-screen bg-siit-light font-sans">
                <AuthHeader />
                <div className="p-8 text-center text-lg">No submission found.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-siit-light font-sans">
            
            <AuthHeader /> 

            <main className="flex-grow p-8">
                <div className="max-w-4xl mx-auto">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-siit-purple hover:underline mb-4 block"
                    >
                        &larr; Back to List
                    </button>

                    {/* --- Header Card --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Complaint #{submission.SubmissionID}
                            </h1>
                            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(submission.Status)}`}>
                                {submission.Status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <div>
                                <p><strong>Topic:</strong> {submission.TopicName}</p>
                            </div>
                            <p className="text-right"><strong>Date Submitted:</strong> {submission.Date}</p>
                        </div>
                    </div>

                    {/* --- Submission Details (User's Answers) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                            Submission Details
                        </h2>
                        <div className="space-y-6">
                            {answers.map((answer, index) => {
                                
                                // Parse the label to remove keywords
                                let label = answer.QText;
                                if (label.includes('DROPDOWN:')) {
                                    label = label.split('DROPDOWN:')[0].trim();
                                } else if (label.includes('CHECKBOX:')) {
                                    label = label.split('CHECKBOX:')[0].trim();
                                } else if (label.includes('FILE:')) {
                                    label = label.split('FILE:')[0].trim();
                                }

                                return (
                                    <div key={index} className="bg-gray-50 p-4 rounded-md border">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            {label} 
                                        </label>
                                        
                                        {/* Logic to display answer or image */}
                                        {answer.AnswerText && (answer.AnswerText.endsWith('.jpg') || answer.AnswerText.endsWith('.png') || answer.AnswerText.endsWith('.jpeg')) ? (
                                            <img 
                                                src={`http://localhost/siit-complaint-system/backend/uploads/${answer.AnswerText}`} 
                                                alt="Submission attachment"
                                                className="max-w-md rounded-lg border"
                                            />
                                        ) : (
                                            <p className="text-gray-800 whitespace-pre-wrap">{answer.AnswerText}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Official Resolution Section --- */}
                    {(submission.Status === 'Resolved' || submission.Status === 'In Progress') && resolution && (
                        <div className="bg-white p-6 rounded-xl shadow-lg mt-8 border-t-4 border-green-500">
                            <h2 className="text-2xl font-bold text-green-700 mb-6 border-b pb-2">
                                Official Resolution
                            </h2>
                            <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-4">
                                <p className="text-sm text-gray-600">
                                    Responded by: <strong className="font-semibold">{resolution.AdminName}</strong> on {resolution.ResDate}
                                </p>
                                <p className="text-gray-800 mt-4 whitespace-pre-wrap">
                                    {resolution.ResText}
                                </p>
                                
                                {resolution.AttachmentPath && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Attachment:</h4>
                                        <img 
                                            src={`http://localhost/siit-complaint-system/backend/${resolution.AttachmentPath}`} 
                                            alt="Resolution attachment" 
                                            className="max-w-md rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default SubmissionDetail;