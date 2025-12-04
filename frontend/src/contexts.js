import { createContext } from 'react';

export const AuthContext = createContext({
    isAuthenticated: false,
    userId: null, 
    userRole: null,
    isLoading: false,
    isAdmin: false,
    isStudent: false,
    roleLabel: 'Guest',
    handleLogout: () => {},
});

export const NavigationContext = createContext(null);