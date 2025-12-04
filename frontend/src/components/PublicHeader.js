import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PublicHeader = ({ page }) => {
    const navigate = useNavigate();

    const renderNav = () => {
        // For LoginPage: Show "Menu" and "Signup"
        if (page === 'login') {
            return (
                <nav className="flex items-center space-x-4">
                    
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Menu
                    </button>
                    
                    <Link 
                        to="/signup" 
                        className="bg-siit-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        Sign up
                    </Link>
                </nav>
            );
        }

        // For SignupPage: Show "Menu" and "Login"
        if (page === 'signup') {
            return (
                <nav className="flex items-center space-x-4">
                    
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Menu
                    </button>

                    <Link 
                        to="/login" 
                        className="bg-siit-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        Login
                    </Link>
                </nav>
            );
        }

        // Default (for homepage / MenuAnonymous)
        return (
            <nav className="flex items-center space-x-4">
                <Link 
                    to="/signup" 
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    Sign up
                </Link>
                <Link 
                    to="/login" 
                    className="bg-siit-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    Login
                </Link>
            </nav>
        );
    };

    return (
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
            
            {/* Standardized Title */}
            <h1 className="text-xl font-bold text-siit-purple">
                SIIT Complaint System
            </h1>
            
            {renderNav()}
        </header>
    );
};

export default PublicHeader;