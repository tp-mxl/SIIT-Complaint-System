import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TopicSelection = ({ setSubmissionData }) => {
    const [topics, setTopics] = useState([]);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [selectedTopicName, setSelectedTopicName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                // Fetch from the getTopics.php endpoint
                const response = await fetch('http://localhost/siit-complaint-system/backend/getTopics.php');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    setTopics(data.topics);
                    setError(null);
                } else {
                    setError(data.message || 'API returned an error.');
                }
            } catch (e) {
                setError('Failed to connect to MAMP server or fetch data. Check MAMP status/DB tables.');
                console.error('Fetch Error:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, []);

    const handleTopicChange = (e) => {
        const id = e.target.value;
        setSelectedTopicId(id);
        const name = topics.find(t => t.TopicID.toString() === id)?.Tname || '';
        setSelectedTopicName(name);
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (selectedTopicId) {
            
            // Navigate to ComplaintForm, passing the topicName/ID in the location state
            navigate('/submit-complaint', { 
                state: { 
                    topicId: parseInt(selectedTopicId), 
                    topicName: selectedTopicName 
                }
            });
        } else {
            console.error('Please select a topic before continuing.'); 
            setError('Please select a topic before continuing.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-siit-purple">Loading topics...</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-siit-light p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-4 border-siit-purple">
                <h1 className="text-2xl font-bold text-siit-purple mb-6 text-center">Select Complaint Topic</h1>
                
                <form onSubmit={handleNext}>
                    {error && <p className="text-red-600 mb-4 border p-2 bg-red-50 rounded-lg text-sm">Error: {error}</p>}

                    <div className="mb-6">
                        <label htmlFor="topic-select" className="block text-gray-700 font-semibold mb-2">
                            Topic
                        </label>
                        <select
                            id="topic-select"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-siit-purple focus:border-siit-purple transition duration-150 ease-in-out"
                            value={selectedTopicId}
                            onChange={handleTopicChange}
                        >
                            <option value="">Please select a topic...</option>
                            {topics.map((topic) => (
                                <option key={topic.TopicID} value={topic.TopicID}>
                                    {topic.Tname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={!selectedTopicId}
                        className={`w-full py-3 rounded-xl font-bold transition duration-300 ease-in-out 
                            ${selectedTopicId 
                                ? 'bg-siit-purple text-white hover:bg-purple-700 shadow-lg' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                    
                    <Link to="/" className="mt-4 block text-center text-sm text-gray-500 hover:text-siit-purple">
                        &larr; Back to Menu
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default TopicSelection;