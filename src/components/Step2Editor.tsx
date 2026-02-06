import React, { useState, useEffect, useCallback } from 'react';
import { ResumeData, TabId, Experience } from '../types';
import { refineResumeSummary, refineExperienceHighlights } from '../services/geminiService';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { categorizeResume, saveCategorizedInsights, extractKeywordsFromJD, recommendTemplates, ResumeCategorization } from '../resume-categorization-service';
import TemplateRenderer from '../template-renderer';
import { ChevronUp, ChevronDown, Target, Linkedin, Github, Image as ImageIcon, Sparkles, Trash2, Plus, Globe, FileText, Mail, Phone, MapPin, User, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { ROLE_TAXONOMY, getRoleSuggestions, saveCustomRole } from '../constants/roles';
import { highlightKeywords } from '../utils/keywordHighlighter';
import { renderHighlightedText } from '../utils/reactKeywordHighlighter';
import { autoCorrectWithSuggestions } from '../utils/autoCorrector';
import KeywordHighlightDisplay from './KeywordHighlightDisplay';
import RoleAnalysisPanel from './RoleAnalysisPanel';

// Utility: Calculate total years of experience from work history
const calculateExperienceYears = (experiences: Experience[]): number => {
    let totalMonths = 0;
    const currentDate = new Date();

    experiences.forEach(exp => {
        if (!exp.startDate?.trim()) return;

        // Parse start date
        const startMatch = exp.startDate.match(/([A-Za-z]+)\s*(\d{4})/);
        if (!startMatch) return;

        const startMonth = new Date(`${startMatch[1]} 1, ${startMatch[2]}`).getMonth();
        const startYear = parseInt(startMatch[2]);

        // Parse end date or use current date if "Present"
        let endMonth, endYear;
        if (!exp.endDate?.trim() || exp.endDate.toLowerCase().includes('present') || exp.endDate.toLowerCase().includes('current')) {
            endMonth = currentDate.getMonth();
            endYear = currentDate.getFullYear();
        } else {
            const endMatch = exp.endDate.match(/([A-Za-z]+)\s*(\d{4})/);
            if (!endMatch) return;
            endMonth = new Date(`${endMatch[1]} 1, ${endMatch[2]}`).getMonth();
            endYear = parseInt(endMatch[2]);
        }

        // Calculate months
        const months = (endYear - startYear) * 12 + (endMonth - startMonth);
        totalMonths += Math.max(0, months);
    });

    return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
};

// Determine experience level from years - aligned with ATS standards
const getExperienceLevelFromYears = (years: number): 'fresher' | '1-3' | '3-5' | '5-8' | '8+' => {
    if (years < 1) return 'fresher';
    if (years < 3) return '1-3';
    if (years < 5) return '3-5';
    if (years < 8) return '5-8';
    return '8+';
};


// Sortable Experience Item Component
interface SortableExperienceItemProps {
    exp: Experience;
    idx: number;
    data: ResumeData;
    updateData: (data: Partial<ResumeData>) => void;
    expandedItems: Record<string, boolean>;
    toggleExpand: (id: string) => void;
    extractedKeywords: { found: string[]; missing: string[] };
}

const SortableExperienceItem: React.FC<SortableExperienceItemProps> = ({ exp, idx, data, updateData, expandedItems, toggleExpand, extractedKeywords }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exp.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white/5 border-2 border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all shadow-lg backdrop-blur-xl">
            {/* Mobile-Optimized Header with Drag Handle */}
            <div className="p-5 md:p-4 flex items-center gap-3 bg-white/5">
                {/* Mobile-Friendly Drag Handle */}
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <svg className="w-6 h-6 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>

                {/* Position & Company Inputs */}
                <div className="flex-1 flex flex-col gap-2">
                    <input
                        value={exp.position}
                        onChange={(e) => {
                            const next = [...data.experience];
                            next[idx].position = e.target.value;
                            updateData({ experience: next });
                        }}
                        placeholder="Position Title"
                        className="bg-transparent border-none outline-none font-bold text-base md:text-sm text-white placeholder:text-slate-500 py-1"
                    />
                    <input
                        value={exp.company}
                        onChange={(e) => {
                            const next = [...data.experience];
                            next[idx].company = e.target.value;
                            updateData({ experience: next });
                        }}
                        placeholder="Company Name"
                        className="bg-transparent border-none outline-none font-medium text-sm md:text-sm text-slate-400 placeholder:text-slate-600 py-1"
                    />
                </div>

                {/* Mobile-Optimized Action Buttons with Up/Down Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toggleExpand(exp.id)}
                        className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 hover:text-white transition-all text-white"
                    >
                        <svg className={`w-5 h-5 md:w-4 md:h-4 transition-transform ${expandedItems[exp.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Item Reorder Controls */}
                    <button
                        onClick={() => {
                            if (idx > 0) {
                                const next = [...data.experience];
                                [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                                updateData({ experience: next });
                            }
                        }}
                        disabled={idx === 0}
                        className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                        title="Move up"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (idx < data.experience.length - 1) {
                                const next = [...data.experience];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                updateData({ experience: next });
                            }
                        }}
                        disabled={idx === data.experience.length - 1}
                        className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                        title="Move down"
                    >
                        <ChevronDown size={16} />
                    </button>

                    <button
                        onClick={() => updateData({ experience: data.experience.filter((_, i) => i !== idx) })}
                        className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-white/20 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/50 transition-all"
                    >
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded Content - Bullet Points */}
            {expandedItems[exp.id] && (
                <div className="p-6 space-y-3 border-t border-white/10 animate-bw-fade-in">
                    {/* Date Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-xs font-semibold text-white mb-1 block">Start Date</label>
                            <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) => {
                                    const next = [...data.experience];
                                    next[idx].startDate = e.target.value;
                                    updateData({ experience: next });
                                }}
                                placeholder="Jan 2020"
                                className="w-full px-4 py-3 md:px-3 md:py-2 bg-white/5 border border-white/20 rounded-xl outline-none focus:border-white/40 text-base md:text-sm text-white placeholder:text-slate-500 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white mb-1 block">End Date</label>
                            <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) => {
                                    const next = [...data.experience];
                                    next[idx].endDate = e.target.value;
                                    updateData({ experience: next });
                                }}
                                placeholder="Present"
                                className="w-full px-4 py-3 md:px-3 md:py-2 bg-white/5 border border-white/20 rounded-xl outline-none focus:border-white/40 text-base md:text-sm text-white placeholder:text-slate-500 min-h-[44px]"
                            />
                        </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2">
                        {exp.highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex gap-3 group">
                                <div className="mt-3 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <div className="flex-1 relative">
                                    <textarea
                                        value={h}
                                        onChange={(e) => {
                                            const next = [...data.experience];
                                            next[idx].highlights[hIdx] = e.target.value;
                                            updateData({ experience: next });
                                        }}
                                        className="w-full py-2 bg-transparent outline-none text-sm md:text-sm leading-relaxed resize-none min-h-[80px] md:min-h-[60px] text-white placeholder:text-slate-500 relative z-10"
                                        placeholder="Describe your achievement with metrics..."
                                    />
                                    {/* Keyword Highlighting Overlay for Experience Bullets */}
                                    {h && extractedKeywords.found.length > 0 && (
                                        <div className="absolute inset-0 py-2 pointer-events-none overflow-hidden">
                                            <div className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {renderHighlightedText(highlightKeywords(h, extractedKeywords.found))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        const next = [...data.experience];
                                        next[idx].highlights = next[idx].highlights.filter((_, i) => i !== hIdx);
                                        updateData({ experience: next });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 w-11 h-11 md:w-6 md:h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-400 transition-all"
                                >
                                    <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Bullet Button */}
                    <button
                        onClick={() => {
                            const next = [...data.experience];
                            next[idx].highlights.push('');
                            updateData({ experience: next });
                        }}
                        className="w-full py-3 md:py-2 border border-dashed border-white/20 rounded-xl text-sm md:text-xs font-semibold text-slate-400 hover:border-white/40 hover:text-white transition-all min-h-[48px]"
                    >
                        + Add Bullet Point
                    </button>
                </div>
            )}
        </div>
    );
};

interface Step2EditorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
    onNext: () => void;
    onBack: () => void;
    validationErrors?: string[];
}

const Step2Editor: React.FC<Step2EditorProps> = ({ data, onChange, onNext, onBack, validationErrors = [] }) => {
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isRefining, setIsRefining] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        experience: true,
        projects: false,
        skills: false,
        education: false
    });
    const [sectionOrder, setSectionOrder] = useState<string[]>([
        'experience', 'projects', 'skills', 'education', 'achievements'
    ]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
    const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [extractedKeywords, setExtractedKeywords] = useState<{ found: string[], missing: string[] }>({ found: [], missing: [] });
    const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoUrl || null);
    const [showPhotoWarning, setShowPhotoWarning] = useState(false);
    const [resumeCategorization, setResumeCategorization] = useState<ResumeCategorization | null>(null);
    const [recommendedTemplates, setRecommendedTemplates] = useState<string[]>([]);
    const [showJDSection, setShowJDSection] = useState(false);
    const [showExperienceMenu, setShowExperienceMenu] = useState(false);
    const [showMarketMenu, setShowMarketMenu] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Toggle section expand/collapse
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Reorder sections
    const reorderSection = (sectionId: string, direction: 'up' | 'down') => {
        const index = sectionOrder.indexOf(sectionId);
        if (direction === 'up' && index > 0) {
            const newOrder = [...sectionOrder];
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
            setSectionOrder(newOrder);
        } else if (direction === 'down' && index < sectionOrder.length - 1) {
            const newOrder = [...sectionOrder];
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
            setSectionOrder(newOrder);
        }
    };

    // COMMON_ROLES moved to src/constants/roles.ts

    // Search roles as user types - LIVE STREAMING with ALL roles from taxonomy
    const handleRoleSearch = async (input: string) => {
        // Use the comprehensive getRoleSuggestions from roles.ts
        // This searches ALL 300+ roles with fuzzy matching
        const matches = getRoleSuggestions(input, 15);
        setRoleSuggestions(matches);
        setShowRoleSuggestions(matches.length > 0);
        setActiveSuggestionIndex(-1);
    };

    // Save role for analytics
    const saveRoleToAnalytics = (role: string) => {
        if (!role) return;
        try {
            const stats = JSON.parse(localStorage.getItem('resume_stats') || '{}');
            stats.roleSearches = stats.roleSearches || {};
            stats.roleSearches[role] = (stats.roleSearches[role] || 0) + 1;
            stats.lastUpdated = new Date().toISOString();
            localStorage.setItem('resume_stats', JSON.stringify(stats));
        } catch (e) {
            console.error('Analytics save failed', e);
        }
    };

    // Grammar check helper
    const checkGrammar = (text: string): string[] => {
        const issues: string[] = [];
        if (!text) return issues;

        if (!text[0]?.match(/[A-Z]/)) issues.push('Start with capital letter');
        if (!text.match(/[.!?]$/)) issues.push('End with punctuation');
        if (text.includes('  ')) issues.push('Extra spaces detected');

        return issues;
    };

    // Validate URLs
    const validateLinkedIn = (url: string): boolean => {
        if (!url) return true;
        return url.includes('linkedin.com/in/');
    };

    const validateGitHub = (url: string): boolean => {
        if (!url) return true;
        return url.includes('github.com/');
    };

    // Validate email
    const validateEmail = (email: string): boolean => {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Photo upload handler
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setPhotoPreview(result);
            updateData({ photoUrl: result });

            // Show ATS warning for tech/finance roles
            const role = data.basics.targetRole.toLowerCase();
            if (role.includes('engineer') || role.includes('developer') ||
                role.includes('analyst') || role.includes('tech') ||
                role.includes('finance') || role.includes('data')) {
                setShowPhotoWarning(true);
            }
        };
        reader.readAsDataURL(file);
    };

    // Extract keywords from JD and calculate ATS metrics
    const extractKeywords = async () => {
        if (!data.jobDescription) return;

        // Use the categorization service to extract keywords
        const jdKeywords = extractKeywordsFromJD(data.jobDescription);

        const allText = [
            data.summary,
            ...data.experience.flatMap(e => e.highlights),
            ...data.projects.map(p => p.description),
            ...data.skills
        ].join(' ').toLowerCase();

        const found = jdKeywords.filter(kw => allText.includes(kw.toLowerCase()));
        const missing = jdKeywords.filter(kw => !allText.includes(kw.toLowerCase()));

        setExtractedKeywords({ found, missing });

        // Update ATS metrics in resume data - REAL calculation based on keyword match
        const matchScore = jdKeywords.length > 0
            ? Math.round((found.length / jdKeywords.length) * 100)
            : 0;

        // Only update if we have a JD to compare against
        if (jdKeywords.length > 0) {
            onChange({
                ...data,
                atsMetrics: {
                    score: matchScore,
                    missingKeywords: missing
                }
            });
        }
    };

    useEffect(() => {
        if (data.jobDescription) {
            extractKeywords();
        }
    }, [data.jobDescription, data.experience, data.summary, data.skills]);

    useEffect(() => {
        setSaveStatus('saving');
        const timer = setTimeout(() => setSaveStatus('saved'), 600);
        return () => clearTimeout(timer);
    }, [data]);

    // Auto-categorize resume when data changes
    useEffect(() => {
        const categorize = async () => {
            if (data && (data.basics.fullName || data.summary || data.experience.length > 0)) {
                try {
                    const categorization = categorizeResume(data);
                    setResumeCategorization(categorization);

                    // Recommend templates based on categorization
                    const templates = recommendTemplates(categorization);
                    setRecommendedTemplates(templates);

                    // Save insights to analytics
                    const sessionId = localStorage.getItem('sessionId') || 'unknown';
                    await saveCategorizedInsights({
                        sessionId,
                        detectedRoleCategory: categorization.primaryCategory,
                        detectedSpecificRole: categorization.specificRole,
                        experienceLevel: categorization.experienceLevel,
                        industryType: categorization.industryType,
                        jdKeywords: [], // Will be updated when JD is processed
                        recommendedTemplates: templates,
                        selectedTemplate: '', // Will be set when template is selected
                        atsScoreRange: [0, 100], // Will be updated when ATS score is calculated
                        sessionStatus: 'complete',
                        stepReached: 'editor',
                        timestamp: new Date()
                    });
                } catch (error) {
                    console.error('Error categorizing resume:', error);
                }
            }
        };

        categorize();
    }, [data]);

    // Update keywords when job description changes
    useEffect(() => {
        if (data.jobDescription) {
            const jdKeywords = extractKeywordsFromJD(data.jobDescription);
            // Update categorized insights with JD keywords
            const sessionId = localStorage.getItem('sessionId') || 'unknown';
            if (resumeCategorization) {
                saveCategorizedInsights({
                    sessionId,
                    detectedRoleCategory: resumeCategorization.primaryCategory,
                    detectedSpecificRole: resumeCategorization.specificRole,
                    experienceLevel: resumeCategorization.experienceLevel,
                    industryType: resumeCategorization.industryType,
                    jdKeywords,
                    recommendedTemplates,
                    selectedTemplate: '',
                    atsScoreRange: [0, 100],
                    sessionStatus: 'complete',
                    stepReached: 'editor',
                    timestamp: new Date()
                });
            }
        }
    }, [data.jobDescription, resumeCategorization, recommendedTemplates]);

    // Drag end handlers
    const handleExperienceDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.experience.findIndex(e => e.id === active.id);
            const newIndex = data.experience.findIndex(e => e.id === over.id);
            updateData({ experience: arrayMove(data.experience, oldIndex, newIndex) });
        }
    };

    const handleProjectDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.projects.findIndex(p => p.id === active.id);
            const newIndex = data.projects.findIndex(p => p.id === over.id);
            updateData({ projects: arrayMove(data.projects, oldIndex, newIndex) });
        }
    };

    const handleEducationDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.education.findIndex(e => e.id === active.id);
            const newIndex = data.education.findIndex(e => e.id === over.id);
            updateData({ education: arrayMove(data.education, oldIndex, newIndex) });
        }
    };

    const handleSkillDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.skills.findIndex((s, i) => `skill-${i}` === active.id);
            const newIndex = data.skills.findIndex((s, i) => `skill-${i}` === over.id);
            updateData({ skills: arrayMove(data.skills, oldIndex, newIndex) });
        }
    };

    const handleAchievementDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data.achievements.findIndex(a => a.id === active.id);
            const newIndex = data.achievements.findIndex(a => a.id === over.id);
            updateData({ achievements: arrayMove(data.achievements, oldIndex, newIndex) });
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const tabs: { id: TabId, label: string }[] = [
        { id: 'profile', label: '1. Profile' },
        { id: 'experience', label: '2. Experience' },
        { id: 'projects', label: '3. Projects' },
        { id: 'skills', label: '4. Skills' },
        { id: 'education', label: '5. Education' },
        { id: 'achievements', label: '6. Achievements' },
    ];

    const updateData = useCallback((newData: Partial<ResumeData>) => {
        // Auto-calculate experience level when experience data changes
        if (newData.experience) {
            const years = calculateExperienceYears(newData.experience);
            const autoLevel = getExperienceLevelFromYears(years);

            // Update experienceLevel automatically
            if (!newData.basics) {
                newData.basics = { ...data.basics, experienceLevel: autoLevel };
            } else {
                newData.basics = { ...newData.basics, experienceLevel: autoLevel };
            }
        }

        onChange({ ...data, ...newData });
    }, [data, onChange]);

    // Validation state
    const [validationWarnings, setValidationWarnings] = useState<any[]>([]);
    const [showValidation, setShowValidation] = useState(false);

    // Validate resume data
    const validateResume = async () => {
        try {
            const { validateUserCV } = await import('../services/honestValidationService');
            const targetMarket = (data.basics.targetMarket as any) || 'india';
            const experienceLevel = (data.basics.experienceLevel as any) || '1-3';

            const result = await validateUserCV({
                targetRole: data.basics.targetRole,
                targetMarket,
                experienceLevel,
                experience: data.experience,
                summary: data.summary
            });

            setValidationWarnings(result.warnings);
            setShowValidation(true);

            if (result.warnings.length > 0) {
                // Show warnings in UI
                console.log('⚠️ Validation warnings:', result.warnings);
            }

            return result;
        } catch (error) {
            console.error('Validation error:', error);
            return null;
        }
    };

    const handleAISuggestions = async () => {
        if (!data.jobDescription) {
            alert("Please paste a Job Description in the right panel first.");
            return;
        }

        // First validate the resume
        const validation = await validateResume();
        if (validation && validation.warnings.some((w: any) => w.type === 'error')) {
            const errorCount = validation.warnings.filter((w: any) => w.type === 'error').length;
            if (!confirm(`Found ${errorCount} validation error(s). Review warnings before proceeding?`)) {
                return;
            }
        }

        setIsRefining(true);
        try {
            const newSuggestions: any[] = [];

            // Use honest rewrite service if available
            const targetMarket = (data.basics.targetMarket as any) || 'india';
            const experienceLevel = (data.basics.experienceLevel as any) || '1-3';

            // Try to use new honest rewrite service
            try {
                const { rewriteWithConstraints } = await import('../services/honestAIRewriteService');
                const { extractJDKeywords } = await import('../services/openaiService');

                const jdKeywords = extractJDKeywords(data.jobDescription || '');

                // Also parse JD for better role/keyword extraction (ENHANCED)
                let enhancedKeywords = [...jdKeywords];
                if (data.jobDescription) {
                    try {
                        const { parseJobDescription } = await import('../universal-jd-parser');
                        const parsedJD = parseJobDescription(data.jobDescription);
                        if (parsedJD.detectedRole) {
                            enhancedKeywords.push(parsedJD.detectedRole.toLowerCase());
                        }
                        parsedJD.hardSkills.forEach(skill => {
                            if (!enhancedKeywords.includes(skill.keyword.toLowerCase())) {
                                enhancedKeywords.push(skill.keyword.toLowerCase());
                            }
                        });
                    } catch (parseErr) {
                        console.warn('JD parsing failed:', parseErr);
                    }
                }

                // Rewrite summary with constraints (ENHANCED for ATS)
                if (data.summary) {
                    const summaryResult = await rewriteWithConstraints({
                        mode: 'rewrite',
                        role: data.basics.targetRole || 'Software Engineer',
                        market: targetMarket,
                        experienceLevel,
                        jdKeywords: enhancedKeywords.length > 0 ? enhancedKeywords : undefined,
                        originalText: data.summary
                    });

                    if (summaryResult.rewritten !== data.summary) {
                        newSuggestions.push({
                            id: 'summary-suggest',
                            field: 'summary',
                            original: data.summary,
                            suggested: summaryResult.rewritten,
                            warnings: summaryResult.warnings,
                            changes: summaryResult.changes
                        });
                    }
                }

                // Rewrite experience bullets
                if (data.experience.length > 0) {
                    for (const exp of data.experience) {
                        if (exp.highlights && exp.highlights.length > 0) {
                            for (let idx = 0; idx < exp.highlights.length; idx++) {
                                const bulletResult = await rewriteWithConstraints({
                                    mode: 'rewrite',
                                    role: data.basics.targetRole || 'Software Engineer',
                                    market: targetMarket,
                                    experienceLevel,
                                    jdKeywords: enhancedKeywords.length > 0 ? enhancedKeywords : undefined, // Use enhanced keywords for better JD matching
                                    originalText: exp.highlights[idx]
                                });

                                if (bulletResult.rewritten !== exp.highlights[idx]) {
                                    newSuggestions.push({
                                        id: `exp-highlight-${exp.id}-${idx}`,
                                        field: 'experience-highlight',
                                        original: exp.highlights[idx],
                                        suggested: bulletResult.rewritten,
                                        warnings: bulletResult.warnings,
                                        changes: bulletResult.changes,
                                        parentId: exp.id
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (rewriteError) {
                console.warn('Honest rewrite service unavailable, using fallback:', rewriteError);
                // Fallback to old service
                const suggestedSummary = await refineResumeSummary(data.summary, data.basics.targetRole, data.jobDescription);
                if (suggestedSummary !== data.summary) {
                    newSuggestions.push({ id: 'summary-suggest', field: 'summary', original: data.summary, suggested: suggestedSummary });
                }

                if (data.experience.length > 0) {
                    const exp = data.experience[0];
                    const suggestedHighlights = await refineExperienceHighlights(exp.highlights, exp.position, exp.company, data.jobDescription);
                    suggestedHighlights.forEach((sh, idx) => {
                        if (sh !== exp.highlights[idx]) {
                            newSuggestions.push({
                                id: `exp-highlight-${exp.id}-${idx}`,
                                field: 'experience-highlight',
                                original: exp.highlights[idx],
                                suggested: sh,
                                parentId: exp.id
                            });
                        }
                    });
                }
            }

            setSuggestions(newSuggestions);
        } catch (e) {
            console.error(e);
            alert('AI rewrite failed. Please try again.');
        } finally {
            setIsRefining(false);
        }
    };

    const acceptSuggestion = (s: any) => {
        if (s.field === 'summary') {
            updateData({ summary: s.suggested });
        } else if (s.field === 'experience-highlight') {
            const newExp = data.experience.map(e => {
                if (e.id === s.parentId) {
                    const newHighlights = [...e.highlights];
                    const idx = e.highlights.indexOf(s.original);
                    if (idx !== -1) newHighlights[idx] = s.suggested;
                    return { ...e, highlights: newHighlights };
                }
                return e;
            });
            updateData({ experience: newExp });
        }
        setSuggestions(prev => prev.filter(item => item.id !== s.id));
    };

    const rejectSuggestion = (id: string) => {
        setSuggestions(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 overflow-hidden">
            {/* Top Navigation Bar - Premium Glass Design */}
            <div className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 md:px-8 z-50 shrink-0">
                <button onClick={onBack} className="text-sm font-semibold text-white hover:text-slate-300 transition-all duration-200 ease-out flex items-center gap-2 group min-w-[44px] min-h-[44px] active:scale-95 border-2 border-white/20 px-4 py-2 rounded-xl hover:border-white/40">
                    <svg className="w-5 h-5 md:w-4 md:h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Back</span>
                </button>
                <div className={`hidden md:flex items-center gap-2 transition-opacity duration-bw ${saveStatus === 'idle' ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`w-2 h-2 rounded-full transition-colors duration-bw ${saveStatus === 'saving' ? 'bg-slate-400 animate-pulse' : 'bg-white'}`} />
                    <span className="text-xs font-medium text-slate-400">
                        {saveStatus === 'saving' ? 'Saving...' : `Saved`}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {validationErrors.length > 0 && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-400/30 rounded-xl animate-bw-fade-in backdrop-blur-sm">
                            <span className="text-red-300 text-xs font-semibold">Missing:</span>
                            <span className="text-red-200 text-xs">{validationErrors.join(' • ')}</span>
                        </div>
                    )}

                    {/* Validation Warnings Panel */}
                    {showValidation && validationWarnings.length > 0 && (
                        <div className="hidden md:block fixed top-20 right-4 bg-yellow-500/10 border-2 border-yellow-400/30 rounded-xl p-4 max-w-md z-50 backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                <h3 className="font-semibold text-yellow-300">Validation Warnings</h3>
                                <button
                                    onClick={() => setShowValidation(false)}
                                    className="ml-auto text-yellow-300 hover:text-yellow-200 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {validationWarnings.map((w, i) => (
                                    <div key={i} className="text-sm text-yellow-200">
                                        <strong className="text-yellow-300">{w.field}:</strong> {w.message}
                                        {w.fix && (
                                            <div className="text-xs text-yellow-300/80 mt-1 ml-4">
                                                💡 {w.fix}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onNext}
                        className="relative overflow-hidden group bg-white text-black px-6 md:px-6 py-3 md:py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-200 hover:shadow-lg transition-all duration-200 ease-out active:scale-95 min-w-[120px] min-h-[44px]"
                    >
                        <span className="relative z-10">Continue</span>
                        <span className="absolute inset-0 bg-black opacity-0 group-active:opacity-10 transition-opacity duration-150"></span>
                    </button>
                </div>
            </div>

            {/* Mobile + Desktop Layout */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                {/* LEFT PANEL - Premium Glass Design with Tabs */}
                <div className="w-full md:w-[320px] lg:w-[400px] xl:w-[440px] bg-gradient-to-br from-black via-slate-900 to-black border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto custom-scrollbar backdrop-blur-xl">
                    <div className="p-6 space-y-5">

                        {/* Premium Header */}
                        <div className="space-y-3 pb-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                <h2 className="text-sm md:text-base font-semibold text-white">Resume Context</h2>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">Configure your target role, market, and job requirements for AI-optimized output</p>
                        </div>

                        {/* Target Role with AI Suggestions */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Target size={14} className="text-slate-400" />
                                <span>Target Role</span>
                                <span className="text-xs text-slate-500 font-normal ml-auto">Required</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.basics.targetRole || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleRoleSearch(value);
                                        // Auto-correct common role typos
                                        const corrected = autoCorrectWithSuggestions(value);
                                        updateData({ basics: { ...data.basics, targetRole: corrected.applied ? corrected.corrected : value } });
                                    }}
                                    onFocus={() => handleRoleSearch(data.basics.targetRole || '')}
                                    onBlur={(e) => {
                                        setTimeout(() => setShowRoleSuggestions(false), 300);
                                        // Final auto-correction on blur
                                        const corrected = autoCorrectWithSuggestions(e.target.value);
                                        if (corrected.applied && corrected.corrected !== e.target.value) {
                                            updateData({ basics: { ...data.basics, targetRole: corrected.corrected } });
                                        }
                                        if (data.basics.targetRole) saveRoleToAnalytics(data.basics.targetRole);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && activeSuggestionIndex >= 0 && roleSuggestions[activeSuggestionIndex]) {
                                            e.preventDefault();
                                            updateData({ basics: { ...data.basics, targetRole: roleSuggestions[activeSuggestionIndex] } });
                                            setShowRoleSuggestions(false);
                                        }
                                    }}
                                    placeholder="e.g., AI Engineer, Full Stack Developer..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm"
                                />
                                {showRoleSuggestions && roleSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto">
                                        <div className="px-3 py-2 border-b border-white/10">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Roles</span>
                                        </div>
                                        {roleSuggestions.map((role, idx) => (
                                            <button
                                                key={idx}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    updateData({ basics: { ...data.basics, targetRole: role } });
                                                    setShowRoleSuggestions(false);
                                                    saveRoleToAnalytics(role);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!data.basics.targetRole && (
                                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        This field is required
                                    </p>
                                )}
                            </div>


                        </div>

                        {/* Experience Level - Collapsible Menu */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowExperienceMenu(!showExperienceMenu)}
                                className="w-full flex items-center justify-between py-2.5 px-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-white">Experience Level</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {data.basics.experienceLevel && (
                                        <CheckCircle2 size={14} className="text-green-400" />
                                    )}
                                    <Plus size={16} className={`text-slate-400 transition-transform ${showExperienceMenu ? 'rotate-45' : ''}`} />
                                </div>
                            </button>
                            {showExperienceMenu && (
                                <div className="grid grid-cols-2 gap-2 animate-bw-fade-in pt-1">
                                    {[{ val: 'fresher', label: 'Fresher', desc: '0-1 yrs' }, { val: '1-3', label: '1-3 Years', desc: 'Early' }, { val: '3-6', label: '3-6 Years', desc: 'Mid-level' }, { val: '6+', label: '6+ Years', desc: 'Senior' }].map(level => (
                                        <button
                                            key={level.val}
                                            onClick={() => {
                                                updateData({ basics: { ...data.basics, experienceLevel: level.val } as any });
                                                setShowExperienceMenu(false);
                                            }}
                                            className={`p-2.5 rounded-lg text-left transition-all backdrop-blur-sm ${data.basics.experienceLevel === level.val
                                                ? 'bg-white/10 border border-white/30'
                                                : 'bg-white/5 border border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-xs text-white">{level.label}</div>
                                                    <div className="text-[10px] mt-0.5 text-slate-400">{level.desc}</div>
                                                </div>
                                                {data.basics.experienceLevel === level.val && (
                                                    <CheckCircle2 size={14} className="text-green-400" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!showExperienceMenu && data.basics.experienceLevel && (
                                <p className="text-xs text-slate-400 px-1">
                                    Selected: <span className="text-white font-medium">
                                        {data.basics.experienceLevel === 'fresher' ? 'Fresher (0-1 yrs)' :
                                            data.basics.experienceLevel === '1-3' ? '1-3 Years (Early)' :
                                                data.basics.experienceLevel === '3-6' ? '3-6 Years (Mid-level)' :
                                                    '6+ Years (Senior)'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Target Market - Collapsible Menu with 6 options */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowMarketMenu(!showMarketMenu)}
                                className="w-full flex items-center justify-between py-2.5 px-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-white">Target Market</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {data.basics.targetMarket && (
                                        <CheckCircle2 size={14} className="text-green-400" />
                                    )}
                                    <Plus size={16} className={`text-slate-400 transition-transform ${showMarketMenu ? 'rotate-45' : ''}`} />
                                </div>
                            </button>
                            {showMarketMenu && (
                                <div className="grid grid-cols-2 gap-2 animate-bw-fade-in pt-1">
                                    {[
                                        { val: 'india', label: 'India', icon: '🇮🇳' },
                                        { val: 'us', label: 'US', icon: '🇺🇸' },
                                        { val: 'uk-eu', label: 'UK/EU', icon: '🇬🇧' },
                                        { val: 'gulf', label: 'Gulf', icon: '🌍' },
                                        { val: 'remote', label: 'Remote', icon: '💻' },
                                        { val: 'global', label: 'Global', icon: '🌐' }
                                    ].map(region => (
                                        <button
                                            key={region.val}
                                            onClick={() => {
                                                updateData({ basics: { ...data.basics, targetMarket: region.val } as any });
                                                setShowMarketMenu(false);
                                            }}
                                            className={`p-2.5 rounded-lg text-left transition-all backdrop-blur-sm ${data.basics.targetMarket === region.val
                                                ? 'bg-white/10 border border-white/30'
                                                : 'bg-white/5 border border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{region.icon}</span>
                                                    <span className="font-semibold text-xs text-white">{region.label}</span>
                                                </div>
                                                {data.basics.targetMarket === region.val && (
                                                    <CheckCircle2 size={14} className="text-green-400" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!showMarketMenu && data.basics.targetMarket && (
                                <p className="text-xs text-slate-400 px-1">
                                    Selected: <span className="text-white font-medium">
                                        {data.basics.targetMarket === 'india' ? '🇮🇳 India' :
                                            data.basics.targetMarket === 'us' ? '🇺🇸 US' :
                                                data.basics.targetMarket === 'uk-eu' ? '🇬🇧 UK/EU' :
                                                    data.basics.targetMarket === 'gulf' ? '🌍 Gulf' :
                                                        data.basics.targetMarket === 'remote' ? '💻 Remote' :
                                                            '🌐 Global'}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Collapsible Job Description */}
                        <div className="space-y-3 pt-3 border-t border-white/10">
                            <button
                                onClick={() => setShowJDSection(prev => !prev)}
                                className="w-full flex items-center justify-between text-sm font-semibold text-white hover:text-slate-300 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-slate-400" />
                                    <span>Job Description</span>
                                    <span className="text-xs text-slate-500 font-normal">(Optional)</span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${showJDSection ? 'rotate-180' : ''}`} />
                            </button>
                            {showJDSection && (
                                <div className="space-y-2 animate-bw-fade-in">
                                    <textarea
                                        value={data.jobDescription || ''}
                                        onChange={(e) => updateData({ jobDescription: e.target.value })}
                                        placeholder="Paste the job description here for AI keyword matching..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-xs leading-relaxed resize-none text-slate-300 placeholder:text-slate-600 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-sm font-mono"
                                    />
                                    {/* JD Keyword Matching Visualization */}
                                    {extractedKeywords.found.length > 0 && (
                                        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                <span className="text-xs font-semibold text-green-300">
                                                    {extractedKeywords.found.length} Keywords Matched
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {extractedKeywords.found.slice(0, 10).map((kw, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-green-400/20 text-green-200 text-[10px] rounded border border-green-400/30"
                                                    >
                                                        {kw}
                                                    </span>
                                                ))}
                                                {extractedKeywords.found.length > 10 && (
                                                    <span className="px-2 py-0.5 text-green-300 text-[10px]">
                                                        +{extractedKeywords.found.length - 10} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {extractedKeywords.missing.length > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                <span className="text-xs font-semibold text-amber-300">
                                                    {extractedKeywords.missing.length} Keywords Missing
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {extractedKeywords.missing.slice(0, 10).map((kw, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-amber-400/20 text-amber-200 text-[10px] rounded border border-amber-400/30"
                                                    >
                                                        {kw}
                                                    </span>
                                                ))}
                                                {extractedKeywords.missing.length > 10 && (
                                                    <span className="px-2 py-0.5 text-amber-300 text-[10px]">
                                                        +{extractedKeywords.missing.length - 10} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Role Analysis Panel */}
                                    {data.basics.targetRole && (
                                        <RoleAnalysisPanel
                                            targetRole={data.basics.targetRole}
                                            jdKeywords={extractedKeywords.found.concat(extractedKeywords.missing)}
                                            matchedKeywords={extractedKeywords.found}
                                            missingKeywords={extractedKeywords.missing}
                                            atsScore={data.atsMetrics?.score || 0}
                                            roleCategory={resumeCategorization?.primaryCategory}
                                            experienceLevel={resumeCategorization?.experienceLevel}
                                        />
                                    )}
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Paste the job description to get AI-optimized suggestions and keyword matching for your resume</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* RIGHT PANEL - Premium Black Glass Design */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-black to-slate-900 overflow-hidden">

                    {/* Stepper UI - Premium Glass */}
                    <div className="flex-none border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 shrink-0">
                        <div className="flex items-center justify-between max-w-5xl mx-auto">
                            {tabs.map((tab, index) => (
                                <React.Fragment key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col items-center gap-1 md:gap-2 transition-all duration-200 group min-w-[44px] min-h-[44px] ${activeTab === tab.id ? '' : 'opacity-50 hover:opacity-75'}
                                            }`}
                                    >
                                        <div className={`w-11 h-11 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-white text-black ring-4 ring-white/20 shadow-lg'
                                            : 'bg-white/10 text-white border-2 border-white/20 group-hover:border-white/40'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <span className={`text-[9px] md:text-xs font-semibold uppercase tracking-wide hidden md:block ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}
                                            }`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                    {index < tabs.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-1 md:mx-3 transition-all duration-200 ${tabs.findIndex(t => t.id === activeTab) > index ? 'bg-white/30' : 'bg-white/10'}
                                            }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Form Content Area - Premium Glass Cards */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6 lg:p-12 xl:p-16 bg-black/20">
                        {activeTab === 'profile' && (
                            <div className="max-w-4xl mx-auto space-y-8 animate-bw-fade-up pb-32">
                                {/* User Guidance Banner - Glass Card */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">Complete Your Professional Profile</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                Fill in your details below. Required fields are marked with *. You can edit and reorder sections at any time.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-xs font-semibold text-white ml-1">Full Professional Name *</label>
                                        <input
                                            value={data.basics.fullName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const corrected = autoCorrectWithSuggestions(value);
                                                updateData({ basics: { ...data.basics, fullName: corrected.applied ? corrected.corrected : value } });
                                            }}
                                            onBlur={(e) => {
                                                const corrected = autoCorrectWithSuggestions(e.target.value);
                                                if (corrected.applied && corrected.corrected !== e.target.value) {
                                                    updateData({ basics: { ...data.basics, fullName: corrected.corrected } });
                                                }
                                            }}
                                            className={`w-full px-4 py-3 md:py-2.5 bg-white/5 border-2 rounded-xl outline-none text-sm md:text-sm font-medium text-white placeholder:text-slate-500 transition-all duration-200 backdrop-blur-sm min-h-[48px] md:min-h-[44px] ${!data.basics.fullName
                                                ? 'border-red-400/50 focus:border-red-400 focus:ring-4 focus:ring-red-400/20 shadow-lg shadow-red-500/20'
                                                : 'border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 shadow-lg shadow-white/5'
                                                }`}
                                            placeholder="e.g. John Smith"
                                        />
                                        {!data.basics.fullName && (
                                            <p className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                This field is required
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white ml-1">Email *</label>
                                        <input
                                            value={data.basics.email}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const corrected = autoCorrectWithSuggestions(value);
                                                updateData({ basics: { ...data.basics, email: corrected.applied ? corrected.corrected : value } });
                                            }}
                                            onBlur={(e) => {
                                                const corrected = autoCorrectWithSuggestions(e.target.value);
                                                if (corrected.applied && corrected.corrected !== e.target.value) {
                                                    updateData({ basics: { ...data.basics, email: corrected.corrected } });
                                                }
                                            }}
                                            className={`w-full px-4 py-3 md:py-2.5 bg-white/5 border-2 rounded-xl outline-none text-sm md:text-sm font-medium text-white placeholder:text-slate-500 transition-all duration-200 backdrop-blur-sm min-h-[48px] md:min-h-[44px] ${!data.basics.email || (data.basics.email && !validateEmail(data.basics.email))
                                                ? 'border-red-400/50 focus:border-red-400 focus:ring-4 focus:ring-red-400/20'
                                                : 'border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 shadow-lg shadow-white/5'
                                                }`}
                                            type="email"
                                            placeholder="john@example.com"
                                        />
                                        {!data.basics.email && (
                                            <p className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Email is required
                                            </p>
                                        )}
                                        {data.basics.email && !validateEmail(data.basics.email) && (
                                            <p className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Invalid email format
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white ml-1">Phone</label>
                                        <input
                                            value={data.basics.phone}
                                            onChange={(e) => updateData({ basics: { ...data.basics, phone: e.target.value } })}
                                            className="w-full px-4 py-4 md:py-3 bg-white/5 border-2 border-white/20 rounded-xl outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 text-base md:text-sm font-medium text-white placeholder:text-slate-500 transition-all duration-200 backdrop-blur-sm shadow-lg shadow-white/5 min-h-[56px] md:min-h-0"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white ml-1">Location</label>
                                        <input
                                            value={data.basics.location}
                                            onChange={(e) => updateData({ basics: { ...data.basics, location: e.target.value } })}
                                            className="w-full px-4 py-4 md:py-3 bg-white/5 border-2 border-white/20 rounded-xl outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 text-base md:text-sm font-medium text-white placeholder:text-slate-500 transition-all duration-200 backdrop-blur-sm shadow-lg shadow-white/5 min-h-[56px] md:min-h-0"
                                            placeholder="New York, NY"
                                        />
                                    </div>

                                    {/* LinkedIn (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white ml-1 flex items-center gap-2">
                                            <Linkedin size={14} className="text-blue-400" strokeWidth={2.5} />
                                            LinkedIn (Optional)
                                        </label>
                                        <input
                                            value={data.basics.linkedin || ''}
                                            onChange={(e) => updateData({ basics: { ...data.basics, linkedin: e.target.value } })}
                                            className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl outline-none text-sm font-medium text-white placeholder:text-slate-500 transition-all duration-200 backdrop-blur-sm ${data.basics.linkedin && !validateLinkedIn(data.basics.linkedin)
                                                ? 'border-amber-400/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20'
                                                : 'border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 shadow-lg shadow-white/5'
                                                }`}
                                            placeholder="linkedin.com/in/yourname"
                                        />
                                        {data.basics.linkedin && !validateLinkedIn(data.basics.linkedin) && (
                                            <p className="text-xs text-amber-400 font-medium ml-1 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Invalid LinkedIn URL format
                                            </p>
                                        )}
                                    </div>

                                    {/* GitHub (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white ml-1 flex items-center gap-2">
                                            <Github size={14} className="text-slate-300" strokeWidth={2.5} />
                                            GitHub (Optional)
                                        </label>
                                        <input
                                            value={data.basics.github || ''}
                                            onChange={(e) => updateData({ basics: { ...data.basics, github: e.target.value } })}
                                            className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl outline-none text-sm font-medium text-white placeholder:text-slate-500 transition-all duration-200 backdrop-blur-sm ${data.basics.github && !validateGitHub(data.basics.github)
                                                ? 'border-amber-400/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20'
                                                : 'border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 shadow-lg shadow-white/5'
                                                }`}
                                            placeholder="github.com/yourname"
                                        />
                                        {data.basics.github && !validateGitHub(data.basics.github) && (
                                            <p className="text-xs text-amber-400 font-medium ml-1 flex items-center gap-1">
                                                <AlertTriangle size={12} />
                                                Invalid GitHub URL format
                                            </p>
                                        )}
                                    </div>

                                    {/* Profile Photo Upload - Premium Glass */}
                                    <div className="col-span-1 md:col-span-2 space-y-3 pt-4">
                                        <label className="text-xs font-semibold text-white ml-1">Profile Photo (Optional)</label>

                                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-xl shadow-2xl">
                                            <div className="flex items-start gap-6">
                                                {/* Upload Area */}
                                                <div className="flex flex-col items-center">
                                                    {photoPreview || data.photoUrl ? (
                                                        <div className="relative">
                                                            <img src={photoPreview || data.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shadow-lg" />
                                                            <button
                                                                onClick={() => {
                                                                    setPhotoPreview(null);
                                                                    updateData({ photoUrl: undefined, includePhoto: false });
                                                                }}
                                                                className="absolute -top-1 -right-1 w-7 h-7 bg-white text-black rounded-full text-sm hover:bg-slate-200 shadow-lg flex items-center justify-center transition-all"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="w-28 h-28 rounded-full border-3 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all bg-white/5 shadow-inner">
                                                            <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} className="hidden" />
                                                            <span className="text-white text-3xl">+</span>
                                                            <span className="text-[9px] text-slate-400 font-semibold mt-1">Upload</span>
                                                        </label>
                                                    )}
                                                </div>

                                                {/* Guidance Panel */}
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <p className="text-xs text-white font-bold mb-2">🌍 Regional Guidance:</p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-green-400 text-sm">✓</span>
                                                                <p className="text-[11px] text-slate-400"><span className="font-bold text-white">Gulf/Middle East Jobs:</span> Photo recommended for stronger personal connection</p>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-amber-400 text-sm">⚠</span>
                                                                <p className="text-[11px] text-slate-400"><span className="font-bold text-white">Global/ATS Jobs:</span> Photo not needed - many ATS systems cannot process photos</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Include Photo Checkbox */}
                                                    {(photoPreview || data.photoUrl) && (
                                                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/20 cursor-pointer hover:border-white/40 transition-all">
                                                            <input
                                                                type="checkbox"
                                                                checked={data.includePhoto || false}
                                                                onChange={(e) => updateData({ includePhoto: e.target.checked })}
                                                                className="w-5 h-5 rounded border-white/30 text-blue-500 focus:ring-blue-500/50"
                                                            />
                                                            <span className="text-sm font-bold text-white">Include photo in my resume</span>
                                                        </label>
                                                    )}

                                                    {showPhotoWarning && (
                                                        <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3 backdrop-blur-sm">
                                                            <p className="text-xs text-amber-300 font-semibold">⚠️ ATS Compatibility Note</p>
                                                            <p className="text-xs text-amber-400 mt-1">For tech/finance roles, photos may reduce ATS compatibility.</p>
                                                            <button
                                                                onClick={() => setShowPhotoWarning(false)}
                                                                className="text-xs text-amber-200 font-bold mt-2 underline hover:text-white transition-all"
                                                            >
                                                                Understood
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-slate-500 mt-4 text-center">JPG or PNG format • Max 2MB • Professional headshot recommended</p>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2 pt-4">
                                        <label className="text-xs font-semibold text-white ml-1">Professional Summary *</label>
                                        <textarea
                                            value={data.summary}
                                            onChange={(e) => updateData({ summary: e.target.value })}
                                            placeholder="2-3 sentences (40-60 words). Lead with experience and core skills. Be concise - recruiters scan quickly."
                                            className="w-full px-4 py-3 md:py-2.5 bg-white/5 border-2 border-white/20 rounded-xl outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 text-sm md:text-sm font-medium text-white placeholder:text-slate-500 transition-all backdrop-blur-sm shadow-lg shadow-white/5 min-h-[100px] md:min-h-[90px] leading-relaxed resize-none"
                                        />
                                        <p className="text-xs text-slate-400 ml-1 flex items-center gap-1.5">
                                            <AlertCircle size={14} />
                                            Keep it concise: 2-3 sentences, 40-60 words max. Lead with years of experience and key skills.
                                        </p>
                                        {/* JD Keyword Matching Visualization */}
                                        {data.jobDescription && (extractedKeywords.found.length > 0 || extractedKeywords.missing.length > 0) && (
                                            <KeywordHighlightDisplay
                                                found={extractedKeywords.found}
                                                missing={extractedKeywords.missing}
                                                compact={false}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'experience' && (
                            <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
                                {/* Mobile-First Collapsible Section Header with Reorder Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleSection('experience')}
                                        className="flex-1 flex items-center justify-between p-5 md:p-4 bg-white/5 border-2 border-white/10 rounded-2xl hover:border-white/30 transition-all group min-h-[72px] shadow-lg backdrop-blur-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 md:w-10 md:h-10 bg-white text-black rounded-xl flex items-center justify-center text-xl md:text-lg font-bold shadow-lg">
                                                💼
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-base md:text-sm font-bold text-white">Work Experience</h3>
                                                <p className="text-xs md:text-xs text-slate-400">{data.experience.length} positions</p>
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-6 h-6 md:w-5 md:h-5 text-slate-400 transition-transform duration-200 ${expandedSections.experience ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Section Reorder Controls */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => reorderSection('experience', 'up')}
                                            disabled={sectionOrder.indexOf('experience') === 0}
                                            className="w-9 h-9 md:w-8 md:h-8 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                            title="Move section up"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => reorderSection('experience', 'down')}
                                            disabled={sectionOrder.indexOf('experience') === sectionOrder.length - 1}
                                            className="w-9 h-9 md:w-8 md:h-8 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                            title="Move section down"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                </div>

                                {expandedSections.experience && (
                                    <div className="space-y-4 animate-bw-fade-in">
                                        {/* Mobile-First Add Experience Button */}
                                        <button
                                            onClick={() => updateData({ experience: [{ id: Math.random().toString(36).substr(2, 9), company: '', position: '', startDate: '', endDate: '', highlights: [''] }, ...data.experience] })}
                                            className="w-full py-4 md:py-3 border-2 border-dashed border-white/20 rounded-xl text-sm md:text-xs font-semibold text-slate-400 hover:border-white/40 hover:text-white transition-all flex items-center justify-center gap-2 min-h-[56px]"
                                        >
                                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Experience
                                        </button>

                                        {/* Experience Items with Drag Handle */}
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e: DragEndEvent) => {
                                            const { active, over } = e;
                                            if (over && active.id !== over.id) {
                                                const oldIndex = data.experience.findIndex(item => item.id === active.id);
                                                const newIndex = data.experience.findIndex(item => item.id === over.id);
                                                updateData({ experience: arrayMove(data.experience, oldIndex, newIndex) });
                                            }
                                        }}>
                                            <SortableContext items={data.experience.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                                {data.experience.map((exp, idx) => (
                                                    <SortableExperienceItem
                                                        key={exp.id}
                                                        exp={exp}
                                                        idx={idx}
                                                        data={data}
                                                        updateData={updateData}
                                                        expandedItems={expandedItems}
                                                        toggleExpand={toggleExpand}
                                                        extractedKeywords={extractedKeywords}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
                                <button
                                    onClick={() => updateData({ projects: [{ id: Math.random().toString(36).substr(2, 9), name: '', description: '', githubLink: '' }, ...data.projects] })}
                                    className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:border-white/40 hover:text-white transition-all"
                                >
                                    + Add Project
                                </button>
                                {data.projects.map((proj, idx) => (
                                    <div key={proj.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
                                        <div className="p-6 flex items-center justify-between bg-white/5">
                                            <div className="flex-1 flex flex-col gap-1">
                                                <input
                                                    value={proj.name}
                                                    onChange={(e) => {
                                                        const next = [...data.projects];
                                                        next[idx].name = e.target.value;
                                                        updateData({ projects: next });
                                                    }}
                                                    placeholder="Project Name"
                                                    className="bg-transparent border-none outline-none font-black text-sm text-white placeholder:text-slate-500"
                                                />
                                                <div className="flex gap-4">
                                                    <input
                                                        value={proj.startDate || ''}
                                                        onChange={(e) => {
                                                            const next = [...data.projects];
                                                            next[idx].startDate = e.target.value;
                                                            updateData({ projects: next });
                                                        }}
                                                        placeholder="Jan 2023"
                                                        className="bg-transparent border-none outline-none text-[10px] text-slate-400 placeholder:text-slate-600 w-24"
                                                    />
                                                    <span className="text-slate-600 text-[10px]">-</span>
                                                    <input
                                                        value={proj.endDate || ''}
                                                        onChange={(e) => {
                                                            const next = [...data.projects];
                                                            next[idx].endDate = e.target.value;
                                                            updateData({ projects: next });
                                                        }}
                                                        placeholder="Present"
                                                        className="bg-transparent border-none outline-none text-[10px] text-slate-400 placeholder:text-slate-600 w-24"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleExpand(proj.id)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 transition-all">
                                                    <span className="text-lg font-bold text-white">{expandedItems[proj.id] ? '−' : '+'}</span>
                                                </button>

                                                {/* Project Reorder Controls */}
                                                <button
                                                    onClick={() => {
                                                        if (idx > 0) {
                                                            const next = [...data.projects];
                                                            [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                                                            updateData({ projects: next });
                                                        }
                                                    }}
                                                    disabled={idx === 0}
                                                    className="w-9 h-9 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (idx < data.projects.length - 1) {
                                                            const next = [...data.projects];
                                                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                                            updateData({ projects: next });
                                                        }
                                                    }}
                                                    disabled={idx === data.projects.length - 1}
                                                    className="w-9 h-9 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>

                                                <button onClick={() => updateData({ projects: data.projects.filter((_, i) => i !== idx) })} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/50 transition-all text-white">
                                                    <span className="text-xl">×</span>
                                                </button>
                                            </div>
                                        </div>
                                        {expandedItems[proj.id] && (
                                            <div className="p-8 space-y-4 animate-in slide-in-from-top-2">
                                                <textarea
                                                    value={proj.description}
                                                    onChange={(e) => {
                                                        const next = [...data.projects];
                                                        next[idx].description = e.target.value;
                                                        updateData({ projects: next });
                                                    }}
                                                    className="w-full h-32 p-4 bg-white/5 border border-white/20 rounded-xl outline-none text-[13px] font-medium leading-relaxed resize-none text-white placeholder:text-slate-500"
                                                    placeholder="Project description and impact..."
                                                />
                                                <div className="space-y-3">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Highlights (Optional)</label>
                                                    <div className="space-y-2">
                                                        {(proj.highlights || []).map((h, hIdx) => (
                                                            <div key={hIdx} className="flex gap-3 group">
                                                                <div className="mt-3 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                                                <textarea
                                                                    value={h}
                                                                    onChange={(e) => {
                                                                        const next = [...data.projects];
                                                                        if (!next[idx].highlights) next[idx].highlights = [];
                                                                        next[idx].highlights![hIdx] = e.target.value;
                                                                        updateData({ projects: next });
                                                                    }}
                                                                    className="flex-1 py-2 bg-transparent outline-none text-base md:text-sm leading-relaxed resize-none min-h-[60px] text-white placeholder:text-slate-500"
                                                                    placeholder="Describe a key achievement or feature..."
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const next = [...data.projects];
                                                                        next[idx].highlights = next[idx].highlights?.filter((_, i) => i !== hIdx);
                                                                        updateData({ projects: next });
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-400 transition-all"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const next = [...data.projects];
                                                                if (!next[idx].highlights) next[idx].highlights = [];
                                                                next[idx].highlights!.push('');
                                                                updateData({ projects: next });
                                                            }}
                                                            className="w-full py-2 border border-dashed border-white/20 rounded-xl text-xs font-semibold text-slate-400 hover:border-white/40 hover:text-white transition-all"
                                                        >
                                                            + Add Highlight
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tech Stack (Comma Separated)</label>
                                                    <input
                                                        value={(proj.tech || []).join(', ')}
                                                        onChange={(e) => {
                                                            const next = [...data.projects];
                                                            next[idx].tech = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                                                            updateData({ projects: next });
                                                        }}
                                                        className="w-full px-5 py-3 bg-white/5 border border-white/20 rounded-xl outline-none text-sm font-medium text-white placeholder:text-slate-500"
                                                        placeholder="React, Node.js, AWS, etc."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">GitHub Link (Optional)</label>
                                                    <input
                                                        value={proj.githubLink || ''}
                                                        onChange={(e) => {
                                                            const next = [...data.projects];
                                                            next[idx].githubLink = e.target.value;
                                                            updateData({ projects: next });
                                                        }}
                                                        className={`w-full px-5 py-3 bg-white/5 border-2 rounded-xl outline-none text-sm font-medium text-white placeholder:text-slate-500 transition-all ${proj.githubLink && !proj.githubLink.includes('github.com') ? 'border-red-400/50' : 'border-white/20'}
                                                            }`}
                                                        placeholder="github.com/username/repo"
                                                    />
                                                    {proj.githubLink && !proj.githubLink.includes('github.com') && (
                                                        <p className="text-xs text-red-400 ml-1">Invalid GitHub URL</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div className="max-w-5xl mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
                                <div className="flex flex-wrap gap-3">
                                    {data.skills.map((skill, idx) => (
                                        <div key={idx} className="bg-white/10 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-4 group border border-white/20">
                                            {skill}
                                            <button onClick={() => updateData({ skills: data.skills.filter((_, i) => i !== idx) })} className="text-white/40 hover:text-red-400 transition-all">×</button>
                                        </div>
                                    ))}
                                    <input
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.target as HTMLInputElement).value.trim();
                                                if (val && !data.skills.includes(val)) {
                                                    updateData({ skills: [...data.skills, val] });
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                        placeholder="+ Add Skill"
                                        className="px-6 py-2.5 rounded-full bg-white/5 border border-white/20 outline-none text-[10px] font-black uppercase tracking-widest w-40 focus:w-64 transition-all text-white placeholder:text-slate-500"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'education' && (
                            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
                                <button
                                    onClick={() => updateData({ education: [{ id: Math.random().toString(36).substr(2, 9), institution: '', degree: '', field: '', graduationDate: '' }, ...data.education] })}
                                    className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-[11px] font-bold uppercase tracking-wide text-slate-400 hover:border-white/40 hover:text-white transition-all"
                                >
                                    + Add Education
                                </button>
                                {data.education.map((edu, idx) => (
                                    <div key={edu.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6 space-y-4 backdrop-blur-xl shadow-2xl">
                                        {/* Education Header with Reorder Controls */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-white">Education {idx + 1}</h4>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (idx > 0) {
                                                            const next = [...data.education];
                                                            [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                                                            updateData({ education: next });
                                                        }
                                                    }}
                                                    disabled={idx === 0}
                                                    className="w-9 h-9 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (idx < data.education.length - 1) {
                                                            const next = [...data.education];
                                                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                                            updateData({ education: next });
                                                        }
                                                    }}
                                                    disabled={idx === data.education.length - 1}
                                                    className="w-9 h-9 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateData({ education: data.education.filter((_, i) => i !== idx) })}
                                                    className="w-9 h-9 rounded-lg border border-white/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/50 transition-all flex items-center justify-center text-white"
                                                >
                                                    <span className="text-lg">×</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                value={edu.institution}
                                                onChange={(e) => {
                                                    const next = [...data.education];
                                                    next[idx].institution = e.target.value;
                                                    updateData({ education: next });
                                                }}
                                                className="col-span-2 px-5 py-3 bg-white/5 border border-white/20 rounded-xl outline-none font-bold text-sm text-white placeholder:text-slate-500"
                                                placeholder="Institution"
                                            />
                                            <input
                                                value={edu.degree}
                                                onChange={(e) => {
                                                    const next = [...data.education];
                                                    next[idx].degree = e.target.value;
                                                    updateData({ education: next });
                                                }}
                                                className="px-5 py-3 bg-white/5 border border-white/20 rounded-xl outline-none font-bold text-sm text-white placeholder:text-slate-500"
                                                placeholder="Degree"
                                            />
                                            <input
                                                value={edu.graduationDate}
                                                onChange={(e) => {
                                                    const next = [...data.education];
                                                    next[idx].graduationDate = e.target.value;
                                                    updateData({ education: next });
                                                }}
                                                className="px-5 py-3 bg-white/5 border border-white/20 rounded-xl outline-none font-bold text-sm text-white placeholder:text-slate-500"
                                                placeholder="Year"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300">
                                {data.achievements.map((a, idx) => (
                                    <div key={a.id} className="flex gap-4 group bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                                        <textarea
                                            value={a.description}
                                            onChange={(e) => {
                                                const next = [...data.achievements];
                                                next[idx].description = e.target.value;
                                                updateData({ achievements: next });
                                            }}
                                            className="flex-1 bg-transparent outline-none text-[13px] font-medium leading-relaxed resize-none h-16 text-white placeholder:text-slate-500"
                                            placeholder="Significant award or certification..."
                                        />
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => {
                                                    if (idx > 0) {
                                                        const next = [...data.achievements];
                                                        [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                                                        updateData({ achievements: next });
                                                    }
                                                }}
                                                disabled={idx === 0}
                                                className="w-8 h-8 rounded border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (idx < data.achievements.length - 1) {
                                                        const next = [...data.achievements];
                                                        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                                        updateData({ achievements: next });
                                                    }
                                                }}
                                                disabled={idx === data.achievements.length - 1}
                                                className="w-8 h-8 rounded border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-white"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => updateData({ achievements: data.achievements.filter((_, i) => i !== idx) })} className="w-8 h-8 rounded border border-white/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/50 transition-all flex items-center justify-center text-white">
                                            <span className="text-lg">×</span>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => updateData({ achievements: [...data.achievements, { id: Math.random().toString(36).substr(2, 9), description: '' }] })} className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">+ Add Achievement</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Step2Editor;
