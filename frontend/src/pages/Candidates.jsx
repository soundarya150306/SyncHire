import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Users, ChevronDown, CheckCircle, 
    XCircle, Clock, FileText, Download, ExternalLink, Calendar, Settings 
} from 'lucide-react';

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Retrieve global settings from localStorage to use in the view
    const aiThreshold = parseInt(localStorage.getItem('ai_threshold') || '60', 10);

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch candidates
            try {
                const candRes = await fetch('http://localhost:8000/candidates/', { headers: { 'Authorization': `Bearer ${token}` } });
                if (candRes.ok) {
                    const cData = await candRes.json();
                    setCandidates(cData);
                }
            } catch (e) {
                console.error('Failed to fetch candidates', e);
            }

            // Fetch jobs
            try {
                const jobsRes = await fetch('http://localhost:8000/jobs/', { headers: { 'Authorization': `Bearer ${token}` } });
                if (jobsRes.ok) {
                    const jData = await jobsRes.json();
                    setJobs(jData);
                }
            } catch (e) {
                console.error('Failed to fetch jobs', e);
            }

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (candidateId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/candidates/${candidateId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setCandidates(prev => 
                    prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
                );
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleScheduleSlot = async (candidateId, dateStr) => {
        try {
            const token = localStorage.getItem('token');
            const isoDate = new Date(dateStr).toISOString();
            const res = await fetch(`http://localhost:8000/candidates/${candidateId}/interview_slot`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ interview_slot: isoDate })
            });

            if (res.ok) {
                setCandidates(prev => 
                    prev.map(c => c.id === candidateId ? { ...c, interview_slot: isoDate, status: 'Interview' } : c)
                );
            }
        } catch (error) {
            console.error('Failed to update slot', error);
        }
    };

    const handleDownloadResume = async (candidateId, firstName, lastName) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/candidates/${candidateId}/resume`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${firstName}_${lastName}_resume.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Failed to download resume', error);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Hired': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Interview': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Hired': return <CheckCircle size={14} />;
            case 'Rejected': return <XCircle size={14} />;
            case 'Interview': return <Calendar size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = `${c.first_name} ${c.last_name} ${c.email} ${c.status}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Header section with decorative glows */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-4">
                        <Users size={16} /> Global Candidate Pool
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Candidates</h1>
                    <p className="text-gray-400 max-w-2xl">View, filter, and manage all applicants across your active job postings.</p>
                </div>
                
                {/* Advanced Search & Filtering Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0 glass-panel p-2 z-20">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search candidates..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-white placeholder-gray-500 pl-10 pr-4 py-2 w-full focus:ring-0 text-sm focus:outline-none"
                        />
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-2 w-full sm:w-auto px-2">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-sm text-gray-300 border-none focus:ring-0 focus:outline-none cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="All" className="bg-gray-900">All Statuses</option>
                            <option value="Applied" className="bg-gray-900">Applied</option>
                            <option value="Interview" className="bg-gray-900">Interview</option>
                            <option value="Hired" className="bg-gray-900">Hired</option>
                            <option value="Rejected" className="bg-gray-900">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="glass-panel h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    <p className="text-gray-400 animate-pulse">Scanning candidate pool...</p>
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="glass-panel py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Users size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Candidates Found</h3>
                    <p className="text-gray-400">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="glass-panel overflow-hidden border border-white/5 rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Match</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {filteredCandidates.map((candidate) => (
                                        <React.Fragment key={candidate.id}>
                                            <motion.tr 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`group hover:bg-white/[0.02] transition-all cursor-pointer ${expandedId === candidate.id ? 'bg-white/[0.02]' : ''}`}
                                                onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                                            >
                                                {/* Candidate Name & Email */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-900 to-gray-800 border border-white/10 flex items-center justify-center font-semibold text-white group-hover:border-primary-500/50 transition-colors flex-shrink-0">
                                                                {candidate.first_name[0]}{candidate.last_name[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-white group-hover:text-primary-300 transition-colors">
                                                                    {candidate.first_name} {candidate.last_name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{candidate.email}</div>
                                                            </div>
                                                        </div>
                                                        { candidate.interview_slot && new Date(candidate.interview_slot) > new Date() && (
                                                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary-300 bg-primary-500/10 border border-primary-500/20 px-2 py-1 rounded w-fit ml-14">
                                                                <Calendar size={12} />
                                                                {new Date(candidate.interview_slot).toLocaleString(undefined, { 
                                                                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                
                                                {/* Date */}
                                                <td className="px-6 py-5 text-sm text-gray-400 whitespace-nowrap">
                                                    {candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    }) : 'Recently'}
                                                </td>

                                                {/* AI Score */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-full max-w-[100px] h-2 bg-gray-800 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${candidate.score}%` }}
                                                                transition={{ duration: 1, delay: 0.2 }}
                                                                className={`h-full rounded-full ${
                                                                            candidate.score >= aiThreshold ? 'bg-emerald-500' :
                                                                            candidate.score >= (aiThreshold - 20) ? 'bg-amber-500' : 'bg-red-500'
                                                                }`}
                                                            />
                                                        </div>
                                                        <span className={`text-sm font-semibold font-mono ${
                                                            candidate.score >= aiThreshold ? 'text-emerald-400' :
                                                            candidate.score >= (aiThreshold - 20) ? 'text-amber-400' : 'text-red-400'
                                                        }`}>
                                                            {Math.round(candidate.score)}%
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status Dropdown */}
                                                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                    <div className="relative inline-block">
                                                        <select 
                                                            value={candidate.status}
                                                            onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                                                            className={`appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background cursor-pointer transition-colors ${getStatusStyle(candidate.status)}`}
                                                        >
                                                            <option value="Applied" className="bg-gray-900 text-gray-300">Applied</option>
                                                            <option value="Interview" className="bg-gray-900 text-primary-300">Interview</option>
                                                            <option value="Hired" className="bg-gray-900 text-emerald-300">Hired</option>
                                                            <option value="Rejected" className="bg-gray-900 text-red-300">Rejected</option>
                                                        </select>
                                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            {getStatusIcon(candidate.status)}
                                                        </div>
                                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-5 text-right">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadResume(candidate.id, candidate.first_name, candidate.last_name);
                                                        }}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors tooltip"
                                                        title="Download Resume"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>

                                            {/* Expandable Content (AI Analysis) */}
                                            <AnimatePresence>
                                                {expandedId === candidate.id && (
                                                    <motion.tr 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-primary-900/10 border-b border-primary-500/20"
                                                    >
                                                        <td colSpan="5" className="p-0">
                                                            <div className="px-8 py-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div>
                                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary-400 flex items-center gap-2 mb-3">
                                                                            <Settings size={14} /> AI Analysis Snapshot
                                                                        </h4>
                                                                        <div className="prose prose-invert prose-sm text-gray-300 max-w-none">
                                                                            {(() => {
                                                                                if (!candidate.analysis_feedback) {
                                                                                    return <p className="italic opacity-50">No advanced analysis available for this candidate.</p>;
                                                                                }
                                                                                try {
                                                                                    const parsed = JSON.parse(candidate.analysis_feedback);
                                                                                    return (
                                                                                        <div className="space-y-3">
                                                                                            <p className="text-sm">{parsed.summary}</p>
                                                                                            <div className="flex gap-4">
                                                                                                {parsed.matched_skills && parsed.matched_skills.length > 0 && (
                                                                                                    <div className="flex-1">
                                                                                                        <span className="text-xs text-emerald-400 font-semibold block mb-1">Matched Skills</span>
                                                                                                        <div className="flex flex-wrap gap-1">
                                                                                                            {parsed.matched_skills.slice(0, 5).map(s => (
                                                                                                                <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] capitalize">{s}</span>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                                {parsed.missing_skills && parsed.missing_skills.length > 0 && (
                                                                                                    <div className="flex-1">
                                                                                                        <span className="text-xs text-amber-400 font-semibold block mb-1">Missing Skills</span>
                                                                                                        <div className="flex flex-wrap gap-1">
                                                                                                            {parsed.missing_skills.slice(0, 5).map(s => (
                                                                                                                <span key={s} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] capitalize">{s}</span>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                } catch(e) {
                                                                                    // fallback if not valid JSON
                                                                                    return <div dangerouslySetInnerHTML={{ __html: candidate.analysis_feedback.replace(/\n/g, '<br />') }} />;
                                                                                }
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Candidate Details</h4>
                                                                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                                                            <span className="text-gray-500">Phone</span>
                                                                            <span className="text-gray-200">{candidate.phone || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                                                            <span className="text-gray-500">Applied For Job</span>
                                                                            <span className="text-gray-200">{jobs?.find(j => j.id === candidate.job_id)?.title || `Job #${candidate.job_id}`}</span>
                                                                        </div>
                                                                        
                                                                        {candidate.status === 'Interview' && (
                                                                            <div className="flex flex-col gap-2 py-3 border-b border-white/5">
                                                                                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Confirm Interview Slot</span>
                                                                                <input 
                                                                                    type="datetime-local" 
                                                                                    title="Schedule slot"
                                                                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50"
                                                                                    onChange={(e) => {
                                                                                        if(e.target.value) handleScheduleSlot(candidate.id, e.target.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="pt-2">
                                                                            <button 
                                                                                onClick={() => handleDownloadResume(candidate.id, candidate.first_name, candidate.last_name)}
                                                                                className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-primary-300 text-sm font-medium rounded-lg transition-colors"
                                                                            >
                                                                                <FileText size={16} /> View Full Resume
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Candidates; 
