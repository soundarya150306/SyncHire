import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Lock, Globe, Moon, Save, CheckCircle } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [threshold, setThreshold] = useState(() => {
        return parseInt(localStorage.getItem('ai_threshold') || '60');
    });
    const [darkMode, setDarkMode] = useState(true);
    const [semanticAnalysis, setSemanticAnalysis] = useState(() => {
        return localStorage.getItem('semantic_analysis') !== 'false';
    });
    const [notifications, setNotifications] = useState(() => {
        return localStorage.getItem('notifications') !== 'false';
    });
    const [saved, setSaved] = useState(false);

    // Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    const handleSave = () => {
        localStorage.setItem('ai_threshold', threshold.toString());
        localStorage.setItem('semantic_analysis', semanticAnalysis.toString());
        localStorage.setItem('notifications', notifications.toString());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setSecurityMsg({ type: 'error', text: 'All fields are required.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setSecurityMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        try {
            setChangingPassword(true);
            setSecurityMsg({ type: '', text: '' });
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (res.ok) {
                setSecurityMsg({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await res.json();
                setSecurityMsg({ type: 'error', text: data.detail || 'Failed to update password.' });
            }
        } catch (error) {
            setSecurityMsg({ type: 'error', text: 'An error occurred while updating the password.' });
        } finally {
            setChangingPassword(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'integrations', label: 'Integrations', icon: Globe },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account preferences and application configuration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 font-medium'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {activeTab === 'general' && (
                        <>
                            {/* Theme Section */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Appearance</h3>
                                        <p className="text-sm text-gray-400">Customize the look and feel of the interface.</p>
                                    </div>
                                    <Moon className="text-primary-400" size={20} />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-gray-200">Dark Mode</span>
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </motion.div>

                            {/* AI Configuration */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">AI Configuration</h3>
                                        <p className="text-sm text-gray-400">Fine-tune how the AI analyzes resumes.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Minimum Match Score Threshold</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                                min="0"
                                                max="100"
                                                value={threshold}
                                                onChange={(e) => setThreshold(parseInt(e.target.value))}
                                            />
                                            <span className="text-white font-mono w-12 text-right">{threshold}%</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <span className="block text-gray-200 text-sm font-medium">Semantic Analysis</span>
                                            <span className="block text-gray-500 text-xs mt-1">Enable deep understanding of context beyond keywords.</span>
                                        </div>
                                        <button
                                            onClick={() => setSemanticAnalysis(!semanticAnalysis)}
                                            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${semanticAnalysis ? 'bg-primary-600' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${semanticAnalysis ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary px-6 flex items-center gap-2"
                                >
                                    {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                                    <div>
                                        <span className="block text-gray-200 text-sm font-medium">Email Notifications</span>
                                        <span className="block text-gray-500 text-xs mt-1">Get notified when new candidates apply.</span>
                                    </div>
                                    <button
                                        onClick={() => { setNotifications(!notifications); }}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications ? 'bg-primary-600' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notifications ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                                    <div>
                                        <span className="block text-gray-200 text-sm font-medium">Weekly Digest</span>
                                        <span className="block text-gray-500 text-xs mt-1">Receive a weekly summary of your hiring pipeline.</span>
                                    </div>
                                    <div className="w-12 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
                                        <CheckCircle size={16} /> Account Secured
                                    </div>
                                    <p className="text-sm text-emerald-300/70">Your account is protected with bcrypt-hashed passwords and JWT authentication.</p>
                                </div>
                                <div>
                                    <label className="label">Change Password</label>
                                    <input
                                        type="password"
                                        className="input mb-3"
                                        placeholder="Current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="input mb-3"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                    {securityMsg.text && (
                                        <div className={`mt-3 text-sm py-2 px-3 rounded-lg border ${securityMsg.type === 'error'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                            {securityMsg.text}
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-ghost border border-white/10 mt-4 text-sm"
                                        onClick={handlePasswordChange}
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'integrations' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Integrations</h3>
                            <p className="text-gray-400 text-sm mb-6">Connect your favorite tools to streamline your workflow.</p>
                            <div className="space-y-3">
                                {['LinkedIn', 'Slack', 'Google Calendar'].map(service => (
                                    <div key={service} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <span className="block text-gray-200 text-sm font-medium">{service}</span>
                                            <span className="block text-gray-500 text-xs mt-0.5">Not connected</span>
                                        </div>
                                        <button className="btn btn-ghost border border-white/10 text-xs">Connect</button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
