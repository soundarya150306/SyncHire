import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle, ChevronRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Apply = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                // Fetch public jobs and find the specific one. 
                // Since we don't have a specific public job detail endpoint without auth,
                // we'll filter from the public list.
                const response = await api.get('jobs/public');
                const selectedJob = response.data.find(j => j.id === parseInt(jobId));
                setJob(selectedJob);
            } catch (error) {
                console.error("Failed to fetch job details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('job_id', jobId);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('resume', file);

        try {
             // The /candidates/apply endpoint does not explicitly require current_user 
             // in its function signature, so it should be publicly accessible.
            await api.post('candidates/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
        } catch (error) {
            console.error("Application failed", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-base flex justify-center items-center">
             <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    if (!job && !loading) return (
         <div className="min-h-screen bg-bg-base flex justify-center items-center p-6">
            <div className="glass-panel p-10 text-center max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
                <p className="text-gray-400 mb-8">The position you are looking for may have been closed or doesn't exist.</p>
                <Link to="/careers" className="btn btn-primary w-full justify-center">
                    Browse Open Positions
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-base text-gray-300 font-sans py-12 px-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/careers" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Careers
                </Link>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Apply for {job?.title}</h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        We're excited to learn more about you. Please fill out the form below and attach your resume.
                    </p>
                </div>

                <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    {success ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-emerald-400 w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Successfully Registered!</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Thank you for applying to the <strong>{job?.title}</strong> position. Our recruiting team will review your application and get back to you soon.
                            </p>
                            <Link to="/careers" className="btn btn-ghost border border-white/10 hover:bg-white/5">
                                Return to Job Board
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleApply} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="label text-sm text-gray-400">First Name <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        className="input py-3 w-full bg-surface/50 focus:bg-surface border-white/10" 
                                        value={firstName} 
                                        onChange={e => setFirstName(e.target.value)} 
                                        required 
                                        placeholder="Jane" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="label text-sm text-gray-400">Last Name <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text" 
                                        className="input py-3 w-full bg-surface/50 focus:bg-surface border-white/10" 
                                        value={lastName} 
                                        onChange={e => setLastName(e.target.value)} 
                                        required 
                                        placeholder="Doe" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="label text-sm text-gray-400">Email Address <span className="text-red-400">*</span></label>
                                <input 
                                    type="email" 
                                    className="input py-3 w-full bg-surface/50 focus:bg-surface border-white/10" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    placeholder="jane.doe@example.com" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="label text-sm text-gray-400">Phone Number <span className="text-red-400">*</span></label>
                                <input 
                                    type="tel" 
                                    className="input py-3 w-full bg-surface/50 focus:bg-surface border-white/10" 
                                    value={phone} 
                                    onChange={e => setPhone(e.target.value)} 
                                    required 
                                    placeholder="+1 (555) 000-0000" 
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/10">
                                <label className="label text-sm text-gray-400 mb-3 block">Resume / CV <span className="text-red-400">*</span></label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className={`p-8 rounded-2xl text-center border-dashed border-2 transition-all duration-300 ${file ? 'bg-primary-500/10 border-primary-500/50' : 'bg-surface/30 border-white/10 group-hover:bg-surface/50 group-hover:border-primary-500/30'}`}>
                                        <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                                            <Upload className={file ? "text-primary-400" : "text-gray-500"} size={24} />
                                        </div>
                                        {file ? (
                                            <div>
                                                <p className="text-primary-400 font-medium flex items-center justify-center gap-2 mb-1">
                                                    <FileText size={18} /> {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Click to change file</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-white font-medium mb-1">Upload your resume</p>
                                                <p className="text-sm text-gray-500">PDF, DOCX up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full py-4 text-lg font-medium shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-3"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            Submit Application <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    By submitting this application, you agree to our privacy policy and terms of service.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Apply;
