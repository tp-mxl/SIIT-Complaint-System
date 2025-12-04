import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts.js';
import AuthHeader from './AuthHeader'; 

const ComplaintStart = () => {
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    
    const [answers, setAnswers] = useState({});
    const [files, setFiles] = useState({});
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { userId, userRole } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch all topics on component load
    useEffect(() => {
        setLoading(true);
        fetch('http://localhost/siit-complaint-system/backend/getTopics.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTopics(data.topics);
                } else {
                    setError('Failed to load topics.');
                }
            })
            .catch(() => setError('Network error. Failed to load topics.'))
            .finally(() => setLoading(false));
    }, []);

    // Fetch questions when a topic is selected
    const handleTopicSelect = (topicId) => {
        if (!topicId) {
            setSelectedTopic('');
            setQuestions([]);
            setAnswers({});
            setFiles({});
            return;
        }

        setLoading(true);
        setSelectedTopic(topicId);
        setError('');
        fetch(`http://localhost/siit-complaint-system/backend/getQuestionsByTopic.php?topicId=${topicId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setQuestions(data.questions);
                    const initialAnswers = {};
                    data.questions.forEach(q => {
                        const isFile = q.QText.includes('FILE:');
                        initialAnswers[q.QID] = { text: '', isFile: isFile };
                    });
                    setAnswers(initialAnswers);
                    setFiles({});
                } else {
                    setError('Failed to load questions.');
                }
            })
            .catch(() => setError('Network error. Failed to load questions.'))
            .finally(() => setLoading(false));
    };

    // Handlers for form inputs
    const handleAnswerChange = (qid, value) => {
        setAnswers(prev => ({
            ...prev,
            [qid]: { ...prev[qid], text: value }
        }));
    };

    const handleFileChange = (qid, file) => {
        setFiles(prev => ({
            ...prev,
            [qid]: file
        }));
        
        setAnswers(prev => ({
            ...prev,
            [qid]: { ...prev[qid], text: file ? file.name : '' }
        }));
    };

    //Handler for Checkboxes
    const handleCheckboxChange = (qid, option, isChecked) => {
        const currentAnswer = answers[qid]?.text || '';
        let currentOptions = currentAnswer ? currentAnswer.split(', ') : [];

        if (isChecked) {
            if (!currentOptions.includes(option)) {
                currentOptions.push(option);
            }
        } else {
            currentOptions = currentOptions.filter(opt => opt !== option);
        }
        
        handleAnswerChange(qid, currentOptions.join(', '));
    };


    // Handle final form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!userId || !userRole) {
            setError('Authentication Error: User ID or Role is missing. Please log out and log back in.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('TopicID', selectedTopic);
        formData.append('userId', userId);
        formData.append('userRole', userRole); 
        
        // Package answers
        const simplifiedAnswers = Object.keys(answers).map(qid => ({
            qid: qid,
            text: answers[qid].text,
            isFile: answers[qid].isFile
        }));
        formData.append('answers', JSON.stringify(simplifiedAnswers));

        // Package files
        Object.keys(files).forEach(qid => {
            if (files[qid]) {
                formData.append(`file-${qid}`, files[qid]);
            }
        });

        try {
            const response = await fetch('http://localhost/siit-complaint-system/backend/submitComplaint.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                navigate('/thankyou', { 
                    replace: true, 
                    state: { 
                        submissionId: data.submissionId 
                    } 
                });
            } else {
                setError(`Submission failed. Message: ${data.message}`);
            }
        } catch (err) {
            setError('Network error. Failed to submit complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-siit-light font-sans">
            <AuthHeader /> {/* <-- 2. ADDED IT HERE */}

            <main className="flex-grow p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
                    <button onClick={() => navigate(-1)} className="text-siit-purple hover:underline mb-4">
                        &larr; Back to Menu
                    </button>
                    <h1 className="text-4xl font-extrabold text-siit-purple mb-6 border-b pb-4">
                        File a New Complaint
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Topic Selection */}
                        <div className="mb-6">
                            <label htmlFor="topic" className="block text-lg font-semibold text-gray-800 mb-2">
                                1. Select a Topic <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="topic"
                                value={selectedTopic}
                                onChange={(e) => handleTopicSelect(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-lg"
                                required
                            >
                                <option value="">-- Please select a topic --</option>
                                {topics.map(topic => (
                                    <option key={topic.TopicID} value={topic.TopicID}>
                                        {topic.Tname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Questions */}
                        {loading && <p>Loading questions...</p>}
                        
                        {questions.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    2. Provide Details <span className="text-red-500">*</span>
                                </h2>
                                {questions.map(question => {
                                    const isFile = question.QText.includes('FILE:');
                                    const isCheckbox = question.QText.includes('CHECKBOX:');
                                    const isDropdown = question.QText.includes('DROPDOWN:');

                                    let label = question.QText;
                                    let options = [];
                                    
                                    if (isCheckbox) {
                                        const parts = question.QText.split('CHECKBOX:');
                                        label = parts[0].trim();
                                        options = parts[1].split('|').map(opt => opt.trim().replace('*', ''));
                                    } else if (isDropdown) {
                                        const parts = question.QText.split('DROPDOWN:');
                                        label = parts[0].trim();
                                        options = parts[1].split('|').map(opt => opt.trim().replace('*', ''));
                                    } else if (isFile) {
                                        label = question.QText.split('FILE:')[0].trim();
                                    }

                                    return (
                                        <div key={question.QID} className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {label}
                                            </label>

                                            {isCheckbox ? (
                                                <div className="space-y-2">
                                                    {options.map((option, index) => (
                                                        <label key={index} className="flex items-center text-gray-800">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                onChange={(e) => handleCheckboxChange(question.QID, option, e.target.checked)}
                                                                checked={(answers[question.QID]?.text || '').split(', ').includes(option)}
                                                            />
                                                            <span className="ml-3">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : isDropdown ? (
                                                <select
                                                    value={answers[question.QID]?.text || ''}
                                                    onChange={(e) => handleAnswerChange(question.QID, e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
                                                    required={!label.includes('(If any)')}
                                                >
                                                    <option value="">-- Select an option --</option>
                                                    {options.map((opt, index) => (
                                                        <option key={index} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : isFile ? (
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(question.QID, e.target.files[0])}
                                                    className="mt-1 block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-purple-50 file:text-purple-700
                                                    hover:file:bg-purple-100"
                                                />
                                            ) : (
                                                <textarea
                                                    rows="4"
                                                    value={answers[question.QID]?.text || ''}
                                                    onChange={(e) => handleAnswerChange(question.QID, e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="Enter your detailed response here..."
                                                    required={!label.includes('(If any)')}
                                                />
                                            )}
                                        </div>
                                    );
                                })} 
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg border border-red-300">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="text-center pt-4">
                            <button
                                type="submit"
                                disabled={loading || questions.length === 0}
                                className="w-full sm:w-auto px-8 py-3 bg-siit-purple text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ComplaintStart;