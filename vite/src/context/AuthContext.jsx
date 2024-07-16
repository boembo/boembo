// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect  } from 'react';
import axios from 'axios';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get('http://localhost:3000/api/user', {// Replace with your user data endpoint
                        headers: {Authorization: `Bearer ${storedToken}`},
                    });
                    setUser(response.data);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Handle errors (e.g., clear invalid token, redirect to login)
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserData();
        } else {
            setIsLoading(false);
        }
    }, []);

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
            <AuthContext.Provider value={{user, token, login, logout, isLoading}}>
                {children}
            </AuthContext.Provider>
            );
};
