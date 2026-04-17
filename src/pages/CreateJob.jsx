import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateJob = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('jobs', { title, description, requirements });
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create job", error);
            alert("Failed to create job. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel overflow-hidden"
            >
                <div className="p-8 border-b border-white/5 bg-white/5">
                    <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
                    <p className="text-gray-400 mt-1">Create a new opportunity to find the best talent.</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="label">Job Details</label>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Job Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            className="input pl-10"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Job Description</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <textarea
                                            className="input pl-10 min-h-[120px] resize-y"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe the role, responsibilities, and team culture..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="label">AI Screening Configuration</label>
                            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-primary-500 rounded text-white mt-0.5">
                                        <CheckCircle size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">AI Matching Enabled</h4>
                                        <p className="text-xs text-primary-200 mt-1">
                                            Our AI will automatically score candidates based on the keywords and requirements you provide below.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Key Requirements (Keywords)</label>
                                <textarea
                                    className="input min-h-[100px]"
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    placeholder="e.g. React, JavaScript, TypeScript, CSS, Communication, Team Player"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">Separate skills with commas. The AI uses these to calculate semantic relevance.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                            <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
                            <button type="submit" className="btn btn-primary px-8" disabled={loading}>
                                {loading ? 'Posting...' : 'Post Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateJob;
