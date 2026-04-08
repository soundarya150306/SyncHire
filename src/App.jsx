import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import Candidates from './pages/Candidates';
import Settings from './pages/Settings';
import Careers from './pages/Careers';
import Apply from './pages/Apply';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

const App = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:jobId/apply" element={<Apply />} />

            {/* Application Layout wrapped routes */}
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                <Route path="dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="jobs/create" element={
                    <ProtectedRoute>
                        <CreateJob />
                    </ProtectedRoute>
                } />
                <Route path="jobs/:id" element={
                    <ProtectedRoute>
                        <JobDetail />
                    </ProtectedRoute>
                } />
                <Route path="candidates" element={
                    <ProtectedRoute>
                        <Candidates />
                    </ProtectedRoute>
                } />
                <Route path="settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
            </Route>
        </Routes>
    );
};

export default App;
