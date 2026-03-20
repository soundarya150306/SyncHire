import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Users, Briefcase, TrendingUp, Clock, Filter, MoreHorizontal, Search, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Real stats from API
    const [stats, setStats] = useState({ total_jobs: 0, total_candidates: 0, interviews_scheduled: 0 });
    const [chartData, setChartData] = useState([]);
    const [chartPeriod, setChartPeriod] = useState(7);

    useEffect(() => {
        fetchJobs();
        fetchStats();
    }, []);

    useEffect(() => {
        fetchChartData();
    }, [chartPeriod]);

    // Filter & sort jobs when search or sort changes
    useEffect(() => {
        let result = [...jobs];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(q) ||
                job.description.toLowerCase().includes(q)
            );
        }

        // Sort
        if (sortOrder === 'oldest') {
            result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredJobs(result);
    }, [jobs, searchQuery, sortOrder]);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const fetchChartData = async () => {
        try {
            const response = await api.get(`/dashboard/chart?days=${chartPeriod}`);
            setChartData(response.data);
        } catch (error) {
            console.error("Error fetching chart data", error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-1">Welcome back, here's what's happening with your jobs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-surface border border-white/5 text-sm text-white focus:ring-1 focus:ring-primary-500 w-64 outline-none"
                        />
                    </div>
                    <Link to="/jobs/create" className="btn btn-primary gap-2">
                        <Plus size={18} /> Post New Job
                    </Link>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary-500/10 text-primary-400">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Active Jobs</p>
                                <h3 className="text-2xl font-bold text-white">{stats.total_jobs}</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-secondary-500/10 text-secondary-400">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Candidates</p>
                                <h3 className="text-2xl font-bold text-white">{stats.total_candidates}</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Interviews Scheduled</p>
                                <h3 className="text-2xl font-bold text-white">{stats.interviews_scheduled}</h3>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-panel p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white">Application Trend</h3>
                        <select
                            value={chartPeriod}
                            onChange={(e) => setChartPeriod(parseInt(e.target.value))}
                            className="bg-surface border border-white/5 rounded-md text-xs text-gray-400 px-2 py-1 outline-none"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#131316', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <Area type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Jobs Header */}
            <div className="flex items-center justify-between pt-4">
                <h2 className="text-lg font-bold text-white">Recent Job Postings</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-white/5 text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <ArrowUpDown size={14} /> Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.length === 0 ? (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-surface/20">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white">
                            {searchQuery ? 'No jobs match your search' : 'No jobs posted yet'}
                        </h3>
                        <p className="mt-1 text-gray-500 max-w-sm mx-auto">
                            {searchQuery ? 'Try a different search term.' : 'Create your first job posting to start finding the perfect candidates with AI.'}
                        </p>
                        {!searchQuery && (
                            <div className="mt-6">
                                <Link to="/jobs/create" className="btn btn-primary">Create Job</Link>
                            </div>
                        )}
                    </div>
                ) : (
                    filteredJobs.map((job, index) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="glass-card group relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold text-sm">
                                        {job.title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">{job.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">Active</span>
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium flex items-center gap-1">
                                        <Clock size={10} /> Full-time
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">{job.description}</p>
                            </div>

                            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                                <div className="text-xs text-gray-500 font-medium">
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </div>
                                <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-white hover:text-primary-400 flex items-center gap-1 transition-colors">
                                    View Candidates <Users size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
