import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // In a real app, verify token with backend /me endpoint
            try {
                const savedUser = JSON.parse(localStorage.getItem('user'));
                if (savedUser) setUser(savedUser);
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            // If OTP sent, return that status (don't set token yet)
            if (res.data.otpSent) {
                return { success: true, otpSent: true, email: res.data.email };
            }

            // Fallback for old flow (if any)
            const { token, role, name } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ name, role }));
            setToken(token);
            setUser({ name, role });
            return { success: true, role };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', userData);
            if (res.data.otpSent) {
                return { success: true, otpSent: true, email: res.data.email };
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });

            // Handle Pending Dealer
            if (res.data.pendingApproval) {
                return { success: true, pendingApproval: true, message: res.data.message };
            }

            const { token, role, name } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ name, role }));

            setToken(token);
            setUser({ name, role });

            return { success: true, role };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'OTP Verification failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, verifyOTP, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
