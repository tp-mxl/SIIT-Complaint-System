import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader'; 

const SignupPage = () => {
    const navigate = useNavigate();
    
    // Form state
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [studentName, setStudentName] = useState('');
    const [year, setYear] = useState('');
    const [department, setDepartment] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const departments = ["BA", "CE", "CHE", "CPE", "DE", "EE", "IE", "ME"];

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        
        if (!studentId || !password || !studentName || !year || !department) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('userId', studentId);
        formData.append('password', password);
        formData.append('studentName', studentName);
        formData.append('year', year);
        formData.append('department', department);

        try {
            const response = await fetch('http://localhost/siit-complaint-system/backend/signup.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Signup successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000); 
            } else {
                setError(data.message || 'Signup failed.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-siit-light">
            <PublicHeader page="signup" />

            {/* --- FIX: Added sm:p-8 for consistent padding --- */}
            <main className="flex justify-center items-center flex-grow p-4 sm:p-8">
                
                <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-2xl">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Create Student Account
                    </h1>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Student ID */}
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                                Student ID
                            </label>
                            <input
                                id="studentId"
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="e.g., 6622781027"
                                required
                            />
                        </div>
                        
                        {/* Full Name */}
                        <div>
                            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="studentName"
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="e.g., Jane Doe"
                                required
                            />
                        </div>
                        
                        {/* Year */}
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                Year
                            </label>
                            <select
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
                                required
                            >
                                <option value="" disabled>Select your year</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <select
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
                                required
                            >
                                <option value="" disabled>Select your department</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        {/* Error/Success Messages */}
                        {error && (
                            <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg border border-red-300">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 text-sm font-medium text-green-700 bg-green-100 rounded-lg border border-green-300">
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-siit-purple hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SignupPage;