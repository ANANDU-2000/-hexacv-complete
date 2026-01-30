/**
 * GOAL STEP - First step in the resume building process
 * 
 * Asks critical context questions:
 * - What job are you targeting?
 * - What's your experience level?
 * - Which region/country?
 * 
 * This information drives everything else:
 * - Template recommendations
 * - AI rewrite style
 * - ATS keyword optimization
 */

import React, { useState, useRef, useEffect } from 'react';
import { Target, ChevronDown, ArrowRight, Briefcase, Globe, User } from 'lucide-react';
import { COMMON_ROLES } from '../constants/roles';

export interface GoalData {
    targetRole: string;
    experienceLevel: 'fresher' | '1-3' | '3-6' | '6+';
    country: 'india' | 'global';
}

interface GoalStepProps {
    onComplete: (data: GoalData) => void;
    initialData?: Partial<GoalData>;
}

const EXPERIENCE_LEVELS = [
    { value: 'fresher', label: 'Fresher', description: '0-1 years of experience' },
    { value: '1-3', label: '1-3 Years', description: 'Early career professional' },
    { value: '3-6', label: '3-6 Years', description: 'Mid-level professional' },
    { value: '6+', label: '6+ Years', description: 'Senior/Leadership level' },
] as const;

const COUNTRIES = [
    { value: 'india', label: 'India', description: 'Indian job market format' },
    { value: 'global', label: 'Global', description: 'International/US/UK format' },
] as const;

export default function GoalStep({ onComplete, initialData }: GoalStepProps) {
    const [targetRole, setTargetRole] = useState(initialData?.targetRole || '');
    const [experienceLevel, setExperienceLevel] = useState<GoalData['experienceLevel']>(initialData?.experienceLevel || 'fresher');
    const [country, setCountry] = useState<GoalData['country']>(initialData?.country || 'india');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [filteredRoles, setFilteredRoles] = useState(COMMON_ROLES);
    const roleInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter roles based on input
    useEffect(() => {
        if (targetRole.trim()) {
            const filtered = COMMON_ROLES.filter(role =>
                role.toLowerCase().includes(targetRole.toLowerCase())
            );
            setFilteredRoles(filtered.length > 0 ? filtered : COMMON_ROLES);
            // Auto-show dropdown when typing
            if (filtered.length > 0) {
                setShowRoleDropdown(true);
            }
        } else {
            setFilteredRoles(COMMON_ROLES);
        }
    }, [targetRole]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowRoleDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = () => {
        if (!targetRole.trim()) {
            roleInputRef.current?.focus();
            return;
        }
        onComplete({ targetRole, experienceLevel, country });
    };

    const isValid = targetRole.trim().length > 0;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <nav className="px-6 py-4 border-b border-slate-100">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <div className="bg-black p-2 rounded-xl">
                        <Target size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-black text-black uppercase tracking-tight">HexaResume</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-xl space-y-8">
                    {/* Title */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            What job are you targeting?
                        </h1>
                        <p className="text-slate-600 text-base">
                            This helps us optimize your resume for the right keywords and format
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Target Role - Searchable Dropdown */}
                        <div className="space-y-2" ref={dropdownRef}>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Briefcase size={16} />
                                Target Role
                            </label>
                            <div className="relative">
                                <input
                                    ref={roleInputRef}
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    onFocus={() => setShowRoleDropdown(true)}
                                    placeholder="e.g., Software Engineer, Data Scientist..."
                                    className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-base font-medium focus:border-black focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                                >
                                    <ChevronDown size={20} className={`transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                {showRoleDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                        {filteredRoles.slice(0, 15).map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    setTargetRole(role);
                                                    setShowRoleDropdown(false);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                {role}
                                            </button>
                                        ))}
                                        {filteredRoles.length === 0 && (
                                            <div className="px-4 py-3 text-sm text-slate-500">
                                                Type your custom role and press continue
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <User size={16} />
                                Experience Level
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => setExperienceLevel(level.value)}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                                            experienceLevel === level.value
                                                ? 'border-black bg-black text-white'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="font-bold text-sm">{level.label}</div>
                                        <div className={`text-xs mt-1 ${experienceLevel === level.value ? 'text-slate-300' : 'text-slate-500'}`}>
                                            {level.description.split(' ')[0]}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Country/Region */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Globe size={16} />
                                Target Region
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {COUNTRIES.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setCountry(c.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            country === c.value
                                                ? 'border-black bg-black text-white'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="font-bold text-base">{c.label}</div>
                                        <div className={`text-xs mt-1 ${country === c.value ? 'text-slate-300' : 'text-slate-500'}`}>
                                            {c.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                            isValid
                                ? 'bg-black text-white hover:bg-slate-800 active:scale-[0.98]'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Continue
                        <ArrowRight size={18} />
                    </button>

                    {/* Trust Note */}
                    <p className="text-xs text-slate-400 text-center">
                        This information helps us tailor your resume. You can change it anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
