/**
 * JD STEP - Job Description Input Step
 * 
 * Makes the JD paste box:
 * - BIG and centered
 * - Shows example JD
 * - Extracts keywords in real-time
 * - Shows what recruiters scan for
 * 
 * This step is CRITICAL for ATS optimization
 */

import React, { useState, useEffect } from 'react';
import { FileText, Zap, ArrowRight, ArrowLeft, Check, Sparkles, Eye } from 'lucide-react';
import { extractJDKeywords } from '../services/openaiService';

interface JDStepProps {
    onComplete: (jd: string, keywords: string[]) => void;
    onBack: () => void;
    targetRole: string;
    initialJD?: string;
}

const EXAMPLE_JD = `Software Engineer - Full Stack

We are looking for a Software Engineer to join our team. You will:
- Build and maintain web applications using React and Node.js
- Design and implement RESTful APIs
- Work with PostgreSQL and MongoDB databases
- Collaborate with product and design teams
- Write clean, maintainable code with proper testing

Requirements:
- 2+ years experience in full-stack development
- Proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Familiarity with SQL and NoSQL databases
- Strong problem-solving skills

Nice to have:
- Experience with AWS or GCP
- Knowledge of Docker and Kubernetes
- Agile/Scrum experience`;

export default function JDStep({ onComplete, onBack, targetRole, initialJD }: JDStepProps) {
    const [jobDescription, setJobDescription] = useState(initialJD || '');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [showExample, setShowExample] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Extract keywords when JD changes (ENHANCED for better role/keyword detection)
    useEffect(() => {
        if (jobDescription.trim().length > 50) {
            setIsAnalyzing(true);
            const timer = setTimeout(async () => {
                try {
                    const extracted = extractJDKeywords(jobDescription);
                    
                    // Also parse JD for role detection
                    try {
                        const { parseJobDescription } = await import('../universal-jd-parser');
                        const parsedJD = parseJobDescription(jobDescription);
                        if (parsedJD.detectedRole) {
                            extracted.unshift(parsedJD.detectedRole.toLowerCase());
                        }
                    } catch (parseErr) {
                        console.warn('JD parsing failed:', parseErr);
                    }
                    
                    setKeywords([...new Set(extracted)]); // Remove duplicates
                } catch (err) {
                    console.error('Keyword extraction failed:', err);
                    setKeywords([]);
                }
                setIsAnalyzing(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setKeywords([]);
        }
    }, [jobDescription]);

    const handleContinue = () => {
        onComplete(jobDescription, keywords);
    };

    const handleSkip = () => {
        onComplete('', []);
    };

    const handleUseExample = () => {
        setJobDescription(EXAMPLE_JD);
        setShowExample(false);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <nav className="px-6 py-4 border-b border-slate-100">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-600 hover:text-black transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium text-sm">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-sm font-medium text-slate-500 hover:text-black transition-colors"
                    >
                        Skip for now
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                <div className="w-full max-w-3xl space-y-6">
                    {/* Title */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-2">
                            <Zap size={16} className="mr-2" />
                            Targeting: {targetRole}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Paste the Job Description
                        </h1>
                        <p className="text-slate-600 text-base max-w-lg mx-auto">
                            We'll extract keywords recruiters scan for in 6-8 seconds and optimize your resume
                        </p>
                    </div>

                    {/* JD Input - Large and Prominent */}
                    <div className="space-y-3">
                        <div className="relative">
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here...

Copy the full job posting from LinkedIn, Indeed, or the company website. Include:
- Job title and responsibilities
- Required skills and qualifications
- Nice-to-have skills"
                                className="w-full h-72 md:h-80 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base font-medium focus:border-black focus:outline-none transition-colors resize-none"
                            />
                            
                            {/* Example Button */}
                            {!jobDescription && (
                                <button
                                    onClick={() => setShowExample(true)}
                                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors"
                                >
                                    <Eye size={16} />
                                    See Example
                                </button>
                            )}
                        </div>

                        {/* Example Modal */}
                        {showExample && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-lg">Example Job Description</h3>
                                        <button
                                            onClick={() => setShowExample(false)}
                                            className="text-slate-400 hover:text-black"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                                        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 p-4 rounded-xl">
                                            {EXAMPLE_JD}
                                        </pre>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 flex gap-3">
                                        <button
                                            onClick={() => setShowExample(false)}
                                            className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-slate-300"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={handleUseExample}
                                            className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800"
                                        >
                                            Use This Example
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Character Count */}
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>{jobDescription.length} characters</span>
                            <span>{keywords.length > 0 ? `${keywords.length} keywords detected` : 'Paste JD to extract keywords'}</span>
                        </div>
                    </div>

                    {/* Keywords Preview */}
                    {keywords.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-emerald-600" />
                                <span className="font-bold text-emerald-800">Keywords Detected ({keywords.length})</span>
                                {isAnalyzing && <span className="text-sm text-emerald-600">Analyzing...</span>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {keywords.slice(0, 15).map((keyword, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                                {keywords.length > 15 && (
                                    <span className="px-3 py-1.5 text-sm text-emerald-600 font-medium">
                                        +{keywords.length - 15} more
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-emerald-700">
                                We'll naturally incorporate these into your resume where relevant
                            </p>
                        </div>
                    )}

                    {/* Why This Matters */}
                    <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <FileText size={18} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-800">Why does this matter?</p>
                            <p className="text-sm text-slate-600 mt-1">
                                Recruiters spend 6-8 seconds scanning resumes. ATS systems filter 75% of applications.
                                Matching JD keywords increases your chances of getting an interview.
                            </p>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleContinue}
                            className={`flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                jobDescription.trim()
                                    ? 'bg-black text-white hover:bg-slate-800 active:scale-[0.98]'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            {jobDescription.trim() ? (
                                <>
                                    <Check size={18} />
                                    Continue with {keywords.length} Keywords
                                </>
                            ) : (
                                <>
                                    Continue Without JD
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
