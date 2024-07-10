// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        // Optionally, you can save the token to localStorage for persistence
        localStorage.setItem('token', jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
            <AuthContext.Provider value={{user, token, login, logout}}>
                {children}
            </AuthContext.Provider>
            );
};
