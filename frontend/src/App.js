import React, { useState, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext, NavigationContext } from './contexts.js';

import MenuAnonymous from './components/MenuAnonymous';
import OverallResponseView from './components/OverallResponseView'; 
import ComplaintStart from './components/ComplaintStart';
import UserMenu from './components/UserMenu';
import UserHistory from './components/UserHistory';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ThankYouPage from './components/ThankYouPage';
import AdminMenu from './components/AdminMenu'; 
import AdminResponseSheet from './components/AdminResponseSheet'; 
import SubmissionDetail from './components/SubmissionDetail'; 
import AdminResponsePage from './components/AdminResponsePage';

const App = () => {
    // --- Authentication State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null); 
    const [userRole, setUserRole] = useState(null); 
    const [userName, setUserName] = useState(null); 
    
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate(); 

    // --- Logout Function ---
    const handleLogout = useCallback(() => {
        setIsLoading(true); 
        setTimeout(() => {
            setIsAuthenticated(false);
            setUserRole(null);
            setUserId(null); 
            setUserName(null); 
            setIsLoading(false); 
            navigate('/');
        }, 500);
    }, [navigate]); 

    // --- Derived State for Roles ---
    const roleLabel = userRole === 'Admin' ? 'Administrator' : 
                      userRole === 'Staff' ? 'Staff Member' : 
                      userRole === 'Student' ? 'Student' : 
                      'Guest';
    
    const isAdmin = (userRole === 'Admin' || userRole === 'Staff');
    
    const isStudent = userRole === 'Student';
    
    // --- Context Value ---
    const authContextValue = useMemo(() => ({
        userId, 
        userRole,
        userName, 
        isAuthenticated,
        isLoading,
        handleLogout,
        isAdmin,
        isStudent,
        roleLabel,
        setUserName, 
    }), [userId, userRole, userName, isAuthenticated, isLoading, handleLogout, isAdmin, isStudent, roleLabel]);

    // --- Main Render ---
    return (
        <AuthContext.Provider value={authContextValue}>
            <NavigationContext.Provider value={navigate}>
                <Routes>
                    {/* ----------------- Public Routes ----------------- */}
                    <Route path="/" element={<MenuAnonymous />} />
                    <Route path="/overall-view" element={<OverallResponseView />} />
                    <Route path="/signup" element={<SignupPage />} /> 
                    <Route 
                        path="/login" 
                        element={<LoginPage 
                            setIsAuthenticated={setIsAuthenticated} 
                            setUserRole={setUserRole}
                            setUserId={setUserId} 
                            setUserName={setUserName} 
                        />} 
                    />
                    <Route
                        path="/view-detail/:submissionID"
                        element={<SubmissionDetail />} 
                    />

                    
                    {/* User-Only Routes (Student) */}
                    <Route 
                        path="/portal" 
                        element={(isAuthenticated && !isAdmin) ? 
                            <UserMenu /> : 
                            <Navigate to={isAdmin ? "/admin" : "/login"} replace />} 
                    />
                    <Route 
                        path="/my-history" 
                        element={(isAuthenticated && !isAdmin) ? 
                            <UserHistory /> : 
                            <Navigate to={isAdmin ? "/admin" : "/login"} replace />} 
                    />
                    
                    <Route 
                        path="/topics" 
                        element={isAuthenticated ? 
                            <ComplaintStart /> : 
                            <Navigate to="/login" replace />} 
                    />
                    <Route 
                        path="/thankyou" 
                        element={isAuthenticated ? 
                            <ThankYouPage /> : 
                            <Navigate to="/login" replace />} 
                    />

                    <Route 
                        path="/admin" 
                        element={isAuthenticated && isAdmin ? 
                            <AdminMenu /> : 
                            <Navigate to="/login" replace />} 
                    />
                    <Route 
                        path="/admin/complaints" 
                        element={isAuthenticated && isAdmin ? 
                            <AdminResponseSheet /> : 
                            <Navigate to="/login" replace />} 
                    />
                    <Route 
                        path="/admin/respond/:submissionID" 
                        element={isAuthenticated && isAdmin ? 
                            <AdminResponsePage /> : 
                            <Navigate to="/login" replace />} 
                    />

                </Routes>
            </NavigationContext.Provider>
        </AuthContext.Provider>
    );
};

const AppWrapper = () => (
    <Router>
        <App />
    </Router>
);

export default AppWrapper;