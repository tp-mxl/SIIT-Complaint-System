import React from 'react';
import { Link } from 'react-router-dom';
import AuthHeader from './AuthHeader'; 

const AdminMenu = () => {

    return (
        <div className="flex flex-col min-h-screen bg-siit-light">
            {/* --- Header --- */}
            <AuthHeader /> 

            {/* --- Main Content --- */}
            <main className="flex-grow p-4 sm:p-8">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-extrabold text-siit-purple mb-6">
                        Administrator Tools
                    </h2>

                    <p className="text-gray-600 mb-8">
                        Manage all submitted complaints, set resolutions, and update statuses.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Manage Complaints (Half Width) */}
                        <Link 
                            to="/admin/complaints" 
                            className="block p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-shadow duration-200 shadow-md hover:shadow-lg"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Manage Complaints
                            </h3>
                            <p className="text-gray-600 text-sm">
                                View the admin list and update complaint statuses/resolutions.
                            </p>
                        </Link>

                        {/* View Public Statuses (Half Width) */}
                        <Link 
                            to="/overall-view" 
                            className="block p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-shadow duration-200 shadow-md hover:shadow-lg"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                View Public Statuses
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Check the general, anonymous view of all submissions.
                            </p>
                        </Link>
                        
                        {/* File New Complaint (FULL WIDTH, same as UserMenu) */}
                        <Link 
                            to="/topics" 
                            className="block p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-shadow duration-200 shadow-md hover:shadow-lg col-span-1 md:col-span-2"
                        >
                            <h3 className="text-xl font-semibold text-siit-purple mb-2">
                                File New Complaint
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Submit a new complaint or suggestion to the system.
                            </p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminMenu;