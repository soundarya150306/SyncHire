import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    Briefcase,
    LayoutDashboard,
    PlusCircle,
    Settings,
    Menu,
    X,
    ChevronRight,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, to, active }) => {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-primary-600/10 text-primary-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-primary-500/10'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon size={20} className={`transition-colors ${active ? 'text-primary-400' : 'text-gray-500 group-hover:text-white'}`} />
            <span className="font-medium">{label}</span>
            {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
        </Link>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get user initials and display name
    const getUserInitials = () => {
        if (user?.full_name) {
            const parts = user.full_name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return parts[0].substring(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    const getUserDisplayName = () => {
        if (user?.full_name) return user.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    const getUserRole = () => {
        if (user?.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1);
        return 'Recruiter';
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background text-white selection:bg-primary-500 selection:text-white relative flex flex-col">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-900/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                    <Outlet />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-white selection:bg-primary-500 selection:text-white overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <AnimatePresence mode='wait'>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="w-72 h-full glass-panel m-4 mr-0 flex flex-col relative z-20"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center gap-3 border-b border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Briefcase className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SyncHire</h1>
                                <p className="text-xs text-primary-400 font-medium tracking-wide">RECRUITER SUITE</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                            <SidebarItem
                                icon={LayoutDashboard}
                                label="Dashboard"
                                to="/dashboard"
                                active={location.pathname === '/dashboard'}
                            />
                            <SidebarItem
                                icon={PlusCircle}
                                label="Post New Job"
                                to="/jobs/create"
                                active={location.pathname === '/jobs/create'}
                            />

                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-4 px-2">Management</div>
                            <SidebarItem
                                icon={Users}
                                label="Interview Schedules"
                                to="/candidates"
                                active={location.pathname.startsWith('/candidates')}
                            />
                            <SidebarItem
                                icon={Settings}
                                label="Settings"
                                to="/settings"
                                active={location.pathname === '/settings'}
                            />
                            
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-4 px-2">Public Links</div>
                            <SidebarItem
                                icon={Briefcase}
                                label="Careers Portal"
                                to={`/careers?recruiterId=${user.id}`}
                                active={false}
                            />
                        </nav>

                        {/* User Profile - Real Data */}
                        <div className="p-4 border-t border-white/5">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center border-2 border-background">
                                    <span className="font-bold text-sm text-white">{getUserInitials()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate group-hover:text-primary-300 transition-colors">{getUserDisplayName()}</p>
                                    <p className="text-xs text-gray-500 truncate">{getUserRole()}</p>
                                </div>
                                <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
                <header className="h-20 flex items-center justify-between px-8">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-px h-6 bg-white/10" />
                        <span className="text-sm text-gray-400 font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
