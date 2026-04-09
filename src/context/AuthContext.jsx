import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token by fetching user profile
            api.get('/auth/me')
                .then(response => {
                    const { id, email, full_name, role } = response.data;
                    setUser({ token, id, email, full_name, role });
                })
                .catch((error) => {
                    // Token invalid only if unauthorized, otherwise keep it (network error, server down, etc.)
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('role');
                        localStorage.removeItem('user_id');
                        localStorage.removeItem('full_name');
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, role, user_id, full_name } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', role);
            localStorage.setItem('user_id', user_id);
            localStorage.setItem('full_name', full_name || '');

            setUser({ token: access_token, role, id: user_id, full_name, email });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (email, password, fullName) => {
        try {
            await api.post('/auth/register', { email, password, full_name: fullName });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        localStorage.removeItem('full_name');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
