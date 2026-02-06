import React, { useState } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import ResumeRenderer from './ResumeRenderer';
import { refineResumeSummary } from '../services/geminiService';

interface Step3PreviewProps {
    data: ResumeData;
    setData: (data: ResumeData) => void;
    config: TemplateConfig;
    onBack: () => void;
}

const Step3Preview: React.FC<Step3PreviewProps> = ({ data, setData, config, onBack }) => {
    const [zoom, setZoom] = useState(0.8);
    const [refining, setRefining] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const handleRefine = async () => {
        setRefining(true);
        try {
            const newSummary = await refineResumeSummary(data.summary, data.basics.targetRole, data.jobDescription);
            setData({ ...data, summary: newSummary });
        } catch (e) {
            alert("Failed to refine. Try again later.");
        } finally {
            setRefining(false);
        }
    };

    const downloadPDF = () => {
        setShowPayment(true);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Change Template
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-white rounded shadow-sm text-slate-600 transition-all">-</button>
                        <span className="text-xs font-bold w-12 text-center text-slate-500">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-white rounded shadow-sm text-slate-600 transition-all">+</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefine}
                        disabled={refining}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                        {refining ? 'Optimizing...' : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth={2} /></svg>
                                AI Refine Summary
                            </>
                        )}
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Download ATS-ready PDF
                    </button>
                </div>
            </header>

            {/* Main Preview Area */}
            <main className="flex-1 overflow-auto flex items-start justify-center p-12 custom-scrollbar">
                <div className="transition-all duration-300">
                    <ResumeRenderer data={data} config={config} scale={zoom} />
                </div>
            </main>

            {/* Modal: Simulated Payment */}
            {showPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in duration-300">
                        <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} /></svg>
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Export Final PDF</h3>
                            <p className="text-slate-500">You're 1 click away from applying to your dream role with an ATS-verified layout.</p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-600 font-medium">One-time Export</span>
                                <span className="font-bold text-slate-900">$9.99</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>Includes AI Optimization</span>
                                <span>Unlimited Edits (24h)</span>
                            </div>
                        </div>

                        <button
                            onClick={() => alert("Simulated Payment Success! Final PDF Hash: " + Date.now())}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                        >
                            Confirm & Download
                        </button>

                        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
                            Secure Payment powered by Stripe
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step3Preview;
