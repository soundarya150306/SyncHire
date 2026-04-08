import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(email, password, fullName);
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Registration failed. Try again.');
            }
        }
    };

    return (
        <div className="w-full flex flex-col justify-center items-center py-12 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-glow shadow-primary-500/30 mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                    <p className="mt-2 text-gray-400">Join Nexus AI for smarter recruiting</p>
                </div>

                <div className="glass-panel p-8 backdrop-blur-xl bg-surface/40 border-white/10">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></span>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    className="input bg-black/20 focus:bg-black/40 border-white/5 focus:border-primary-500/50"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Work Email</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    className="input bg-black/20 focus:bg-black/40 border-white/5 focus:border-primary-500/50"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    required
                                    className="input bg-black/20 focus:bg-black/40 border-white/5 focus:border-primary-500/50"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn btn-primary py-3 text-base shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
