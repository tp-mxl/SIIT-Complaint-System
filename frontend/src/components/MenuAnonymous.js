import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from './PublicHeader'; // <-- 1. IMPORT IT

const MenuAnonymous = () => {
    
    return (
        <div className="flex flex-col min-h-screen bg-siit-light">
            
            <PublicHeader page="home" /> {/* <-- 2. ADDED IT HERE */}

            {/* Main Content Area */}
            <main className="flex flex-col items-center justify-center flex-grow p-8">
                <div className="bg-white rounded-xl p-10 shadow-xl w-full max-w-md text-center">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Welcome to SIIT Complaint System</h2>
                    <p className="text-gray-600 mb-8">
                        Access the system to file a new complaint,<br />or view the status of all existing submissions.
                    </p>

                    <Link 
                        to="/overall-view" 
                        className="bg-siit-purple text-white px-6 py-3 rounded-lg w-full max-w-xs block mx-auto shadow-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
                    >
                        View all Complaints
                    </Link>
                </div>
            </main>
            
        </div>
    );
};

export default MenuAnonymous;