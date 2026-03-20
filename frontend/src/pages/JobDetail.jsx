import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Upload, FileText, CheckCircle, XCircle, User, Mail, Phone, Calendar, Download, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CandidateAnalysisModal from '../components/CandidateAnalysisModal';

const statusColors = {
    Applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Interview: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Hired: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Retrieve global settings from localStorage
    const aiThreshold = parseInt(localStorage.getItem('ai_threshold') || '60', 10);

    // Upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Candidate Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // UI State
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchJobAndCandidates();
    }, [id]);

    const fetchJobAndCandidates = async () => {
        try {
            const [jobRes, candidatesRes] = await Promise.all([
                api.get(`/jobs/${id}`),
                api.get(`/candidates/${id}`)
            ]);
            setJob(jobRes.data);
            const sorted = candidatesRes.data.sort((a, b) => b.score - a.score);
            setCandidates(sorted);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('job_id', id);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('resume', file);

        try {
            await api.post('/candidates/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchJobAndCandidates();
            setFile(null);
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload resume");
        } finally {
            setUploading(false);
        }
    };

    const handleStatusChange = async (candidateId, newStatus) => {
        setStatusUpdating(true);
        try {
            const res = await api.patch(`/candidates/${candidateId}/status`, { status: newStatus });
            setCandidates(prev =>
                prev.map(c => c.id === candidateId ? { ...c, status: res.data.status } : c)
            );
            if (selectedCandidate?.id === candidateId) {
                setSelectedCandidate(prev => ({ ...prev, status: res.data.status }));
            }
        } catch (error) {
            console.error("Status update failed", error);
            alert("Failed to update status");
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleCloseJob = async () => {
        if (!window.confirm('Are you sure you want to delete this job and all its candidates?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to delete job", error);
            alert("Failed to close job");
        }
    };

    const handleDownloadResume = async (candidateId) => {
        try {
            const response = await api.get(`/candidates/${candidateId}/resume`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
                : 'resume.pdf';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download resume");
        }
    };

    const [showAnalysis, setShowAnalysis] = useState(false);

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors group">
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>
                <div className="glass-panel p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{job?.title || 'Loading...'}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} /> Posted {job ? new Date(job.created_at).toLocaleDateString() : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User size={14} /> {candidates.length} Applicant{candidates.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {job?.description && (
                                <p className="text-gray-400 mt-3 text-sm max-w-2xl">{job.description}</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCloseJob} className="btn btn-ghost border border-red-500/20 text-red-400 hover:bg-red-500/10">
                                Close Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Candidates Leaderboard */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Top Candidates</h2>
                        <div className="flex gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-primary-500/20 text-primary-400 border border-primary-500/20">AI Ranked</span>
                        </div>
                    </div>

                    {candidates.length === 0 ? (
                        <div className="glass-panel p-12 text-center border-dashed border-white/10">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="text-gray-500" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-white">No candidates yet</h3>
                            <p className="mt-1 text-gray-500">Upload resumes to start the screening process.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {candidates.map((candidate, index) => (
                                    <motion.div
                                        key={candidate.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`glass-card p-4 flex items-center gap-6 group cursor-pointer border-l-4 relative overflow-hidden ${selectedCandidate?.id === candidate.id ? 'border-l-primary-500 bg-white/5' : 'border-l-transparent hover:border-l-primary-500'}`}
                                        onClick={() => setSelectedCandidate(selectedCandidate?.id === candidate.id ? null : candidate)}
                                    >
                                        <div className="z-10 flex-shrink-0 w-8 text-center font-bold text-gray-500">#{index + 1}</div>

                                        <div className="z-10 flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg">
                                            {candidate.first_name[0]}{candidate.last_name[0]}
                                        </div>

                                        <div className="z-10 flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">
                                                {candidate.first_name} {candidate.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate">{candidate.email}</p>
                                        </div>

                                        <div className="z-10 flex-shrink-0">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColors[candidate.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                {candidate.status}
                                            </span>
                                        </div>

                                        <div className="z-10 flex-shrink-0 w-32">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Match</span>
                                                <span className="text-white font-bold">{candidate.score}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${candidate.score}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                                    className={`h-full rounded-full ${candidate.score >= aiThreshold ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                                        candidate.score >= (aiThreshold - 20) ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                                            'bg-gradient-to-r from-red-500 to-red-400'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="z-10 flex-shrink-0">
                                            <button className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Sidebar - Upload & Details */}
                <div className="space-y-6">
                    {/* Add Candidate Card */}
                    <div className="glass-panel p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Upload size={18} className="text-primary-400" /> Add Candidate
                        </h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="label">First Name</label>
                                    <input type="text" className="input text-sm py-2" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Jane" />
                                </div>
                                <div className="space-y-1">
                                    <label className="label">Last Name</label>
                                    <input type="text" className="input text-sm py-2" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="label">Email</label>
                                <input type="email" className="input text-sm py-2" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@example.com" />
                            </div>

                            <div className="space-y-1">
                                <label className="label">Phone</label>
                                <input type="text" className="input text-sm py-2" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 (555) 000-0000" />
                            </div>

                            <div className="space-y-1">
                                <label className="label">Resume</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className="input py-3 text-center border-dashed border-2 bg-surface/30 group-hover:bg-surface/50 group-hover:border-primary-500/50 transition-colors">
                                        {file ? (
                                            <span className="text-primary-400 font-medium flex items-center justify-center gap-2">
                                                <FileText size={16} /> {file.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-sm">Click to upload PDF/DOCX</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-2"
                                disabled={uploading}
                            >
                                {uploading ? 'Analyzing...' : 'Analyze Candidate'}
                            </button>
                        </form>
                    </div>

                    {/* Candidate Quick View */}
                    {selectedCandidate ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 border-l-4 border-l-primary-500">
                            <h3 className="font-bold text-white text-lg mb-1">{selectedCandidate.first_name} {selectedCandidate.last_name}</h3>
                            <p className="text-primary-400 font-medium mb-4">{selectedCandidate.score}% Match</p>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Mail size={16} /> {selectedCandidate.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Phone size={16} /> {selectedCandidate.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <AlertCircle size={16} />
                                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${statusColors[selectedCandidate.status]}`}>
                                        {selectedCandidate.status}
                                    </span>
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div className="space-y-2 mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Change Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Interview', 'Hired', 'Rejected', 'Applied'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(selectedCandidate.id, status)}
                                            disabled={statusUpdating || selectedCandidate.status === status}
                                            className={`text-xs py-1.5 px-2 rounded-lg border transition-colors disabled:opacity-30 ${selectedCandidate.status === status
                                                ? 'bg-primary-500/20 border-primary-500/30 text-primary-400'
                                                : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAnalysis(true)}
                                    className="flex-1 btn btn-primary text-xs flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} /> AI Analysis
                                </button>
                                <button
                                    onClick={() => handleDownloadResume(selectedCandidate.id)}
                                    className="btn btn-ghost border border-white/10 text-xs text-white p-2"
                                    title="Download Resume"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="glass-panel p-6 text-center opacity-50">
                            <p className="text-sm text-gray-500">Select a candidate to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Analysis Modal */}
            {showAnalysis && selectedCandidate && (
                <CandidateAnalysisModal
                    candidate={selectedCandidate}
                    onClose={() => setShowAnalysis(false)}
                />
            )}
        </div>
    );
};

export default JobDetail;
