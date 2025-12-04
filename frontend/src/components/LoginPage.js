import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader'; // <-- 1. IMPORTED

const LoginPage = ({ setIsAuthenticated, setUserRole, setUserId, setUserName }) => {
    const navigate = useNavigate(); 
    const [idInput, setIdInput] = useState('');
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState(''); 
    const [loading, setLoading] = useState(false); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('userId', idInput);
        formData.append('password', password);

        try {
            const response = await fetch('http://localhost/siit-complaint-system/backend/authenticate.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                const role = data.role;
                
                // Set the global authentication state
                setIsAuthenticated(true);
                setUserRole(role);
                setUserId(data.userId); 
                setUserName(data.name); 
                
                // Send BOTH 'Admin' and 'Staff' to the /admin route
                if (role === 'Admin' || role === 'Staff') {
                    navigate('/admin');
                } else {
                    navigate('/portal'); 
                }

            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error or server unavailable.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col min-h-screen bg-siit-light">
            
            <PublicHeader page="login" /> {/* <-- 2. USING THE HEADER */}

            <main className="flex justify-center items-center flex-grow p-4 sm:p-8">
                
                {/* --- 3. FIXED WIDTH --- */}
                <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-2xl">
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Login
                    </h1>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                                Student/Staff/Admin ID
                            </label>
                            <input
                                id="userId"
                                name="userId"
                                type="text"
                                required
                                value={idInput}
                                onChange={(e) => setIdInput(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                                placeholder="e.g., 6622781027 or 1003"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {error && (
                            <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg border border-red-300">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-siit-purple hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging in...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;