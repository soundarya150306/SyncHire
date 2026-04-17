import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Careers = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    const recruiterId = searchParams.get('recruiterId');

    useEffect(() => {
        const fetchPublicJobs = async () => {
            try {
                // Determine if we need to call a public endpoint. 
                // Currently, our backend /jobs/public returns this list.
                const endpoint = recruiterId ? `jobs/public?recruiter_id=${recruiterId}` : 'jobs/public';
                const response = await api.get(endpoint);
                setJobs(response.data);
            } catch (error) {
                console.error("Failed to fetch public jobs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicJobs();
    }, []);

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-bg-base text-gray-300 font-sans selection:bg-primary-500/30">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden bg-surface py-20 border-b border-white/5">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                            Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Future-Ready</span> Team
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            We're looking for passionate individuals to help us build the next generation of revolutionary products. Explore our open positions below.
                        </p>
                        
                        <div className="max-w-xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-lg backdrop-blur-sm"
                                placeholder="Search by job title or keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Job Listings Section */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm border border-primary-500/20">
                            {filteredJobs.length}
                        </span>
                        Open Positions
                    </h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                         <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500/20 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="glass-panel p-16 text-center border-dashed border-white/10">
                         <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="text-gray-500 w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">No active jobs found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {searchTerm ? "We couldn't find any jobs matching your search criteria. Try different keywords." : "There are currently no open positions. Please check back later!"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredJobs.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 group border border-white/5 hover:border-primary-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <p className="text-gray-400 line-clamp-2 mb-4 text-sm leading-relaxed">
                                            {job.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                <Calendar className="w-3.5 h-3.5" /> 
                                                Posted {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Full-time
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <Link 
                                            to={`/careers/${job.id}/apply`}
                                            className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                                        >
                                            Apply Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Careers;
