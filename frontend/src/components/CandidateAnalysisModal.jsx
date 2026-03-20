import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Sparkles, Target, Zap, CalendarDays } from 'lucide-react';
import api from '../api';

const CandidateAnalysisModal = ({ candidate, onClose }) => {
    const [scheduling, setScheduling] = React.useState(false);
    const [scheduleSuccess, setScheduleSuccess] = React.useState(null);
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState("");

    if (!candidate) return null;

    let analysis = { matched_skills: [], missing_skills: [], summary: "No detailed analysis available." };
    try {
        if (candidate.analysis_feedback) {
            analysis = JSON.parse(candidate.analysis_feedback);
        }
    } catch (e) {
        console.error("Failed to parse analysis feedback", e);
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">AI Analysis</h2>
                                <p className="text-sm text-gray-400">{candidate.first_name} {candidate.last_name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                        {/* Score Overview */}
                        <div className="flex items-center gap-8 p-6 rounded-xl bg-white/5 border border-white/5">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-white/5"
                                    />
                                    <motion.circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 40}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - candidate.score / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={candidate.score >= 80 ? 'text-emerald-500' : candidate.score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold text-white">{Math.round(candidate.score)}%</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-medium">Match</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Target size={18} className="text-primary-400" /> Executive Summary
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {analysis.summary}
                                </p>
                            </div>
                        </div>

                        {/* Skills Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Matched Skills */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Key Strengths
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.matched_skills.length > 0 ? analysis.matched_skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium capitalize">
                                            {skill}
                                        </span>
                                    )) : (
                                        <span className="text-sm text-gray-500 italic">No significant matches found.</span>
                                    )}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle size={14} className="text-amber-500" /> Identified Gaps
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.missing_skills.length > 0 ? analysis.missing_skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium capitalize">
                                            {skill}
                                        </span>
                                    )) : (
                                        <span className="text-sm text-gray-500 italic">No major gaps identified.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary-500 rounded text-white mt-0.5">
                                    <Zap size={14} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">AI Recommendation</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {candidate.score >= 80
                                            ? "Strong potential. Highly recommended for immediate interview based on technical alignment."
                                            : candidate.score >= 60
                                                ? "Potential fit. Consider exploring their experience in the identified gap areas during a screening call."
                                                : "Low alignment. Suggested only if other experience strongly compensates for the identified keyword gaps."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5 flex flex-col gap-4">
                        {scheduleSuccess && (
                             <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2">
                                <CheckCircle2 size={18} /> Interview Slot Booked successfully!
                            </div>
                        )}
                        
                        {showDatePicker && !scheduleSuccess ? (
                            <div className="flex items-center gap-3 w-full bg-white/5 p-3 rounded-xl border border-white/10">
                                <input 
                                    type="datetime-local" 
                                    className="flex-1 input-field bg-transparent border-none focus:ring-0 text-sm py-1"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <button
                                    className="btn btn-primary py-2 px-4 shadow-lg shadow-primary-500/20"
                                    disabled={!selectedDate || scheduling}
                                    onClick={async () => {
                                        try {
                                            setScheduling(true);
                                            
                                            // Format date for backend (ISO format handles Timezones properly)
                                            const isoDate = new Date(selectedDate).toISOString();
                                            
                                            await api.patch(`/candidates/${candidate.id}/interview_slot`, {
                                                interview_slot: isoDate
                                            });
                                            
                                            setScheduleSuccess(true);
                                            setTimeout(() => {
                                                setScheduleSuccess(null);
                                                setShowDatePicker(false);
                                                onClose(); // Auto close on success
                                            }, 2000);
                                        } catch (e) {
                                            console.error("Failed to book slot", e);
                                            alert("Failed to book interview slot.");
                                        } finally {
                                            setScheduling(false);
                                        }
                                    }}
                                >
                                    {scheduling ? 'Booking...' : 'Confirm Slot'}
                                </button>
                                <button 
                                    className="btn border border-white/10 hover:bg-white/5 py-2 px-3 text-gray-400"
                                    onClick={() => setShowDatePicker(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : null}

                        {!showDatePicker && !scheduleSuccess && (
                            <div className="flex gap-3 w-full">
                                <button
                                    className="flex-1 btn btn-ghost border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 py-2.5 flex items-center justify-center gap-2"
                                    onClick={() => setShowDatePicker(true)}
                                >
                                    <CalendarDays size={18} /> Schedule Interview
                                </button>
                                <button
                                    className="flex-1 btn btn-primary py-2.5"
                                    onClick={onClose}
                                >
                                    Done Reviewing
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CandidateAnalysisModal;
