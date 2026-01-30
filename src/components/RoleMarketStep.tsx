// Role Market Step Component - Redesigned
// Step 1: Target Role + Market + Experience Level
// Goal: "Tell us who you want to be hired as, and where, so we can structure your resume correctly."

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Search,
  Check,
  ChevronDown,
  FileText,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import { TargetMarket, ExperienceLevel } from '../agents/shared/types';
import { ROLE_TAXONOMY, ROLE_CATEGORIES, getRoleSuggestions, getRoleCorrection, categorizeRole, saveCustomRole } from '../constants/roles';

interface RoleMarketStepProps {
  onComplete: (data: RoleMarketData) => void;
  initialData?: Partial<RoleMarketData>;
}

export interface RoleMarketData {
  targetRole: string;
  targetMarket: TargetMarket;
  experienceLevel: ExperienceLevel;
  targetRoleCategory?: string;
}

// Role taxonomy moved to constants/roles.ts

const MARKET_OPTIONS: { value: TargetMarket; label: string }[] = [
  { value: 'india', label: 'India' },
  { value: 'us', label: 'US' },
  { value: 'uk', label: 'UK' },
  { value: 'eu', label: 'EU' },
  { value: 'gulf', label: 'Gulf' },
  { value: 'remote', label: 'Remote' }
];

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher', years: '0-1yrs' },
  { value: '1-3', label: '1-3', years: 'years' },
  { value: '3-5', label: '3-5', years: 'years' },
  { value: '5-8', label: '5-8', years: 'years' },
  { value: '8+', label: '8+', years: 'years' }
] as const;

// Guidance content based on selections
function getGuidanceContent(market: TargetMarket, experience: string, role: string) {
  const marketGuidance: Record<TargetMarket, { format: string; expectation: string }> = {
    india: { format: 'Skills-first', expectation: 'Technical depth prioritized' },
    us: { format: 'Summary-first', expectation: 'Impact & metrics focus' },
    uk: { format: 'Concise 2-page', expectation: 'European conventions' },
    eu: { format: 'Europass style', expectation: 'Detailed certifications' },
    gulf: { format: 'Detailed format', expectation: 'Photo optional, certifications valued' },
    remote: { format: 'Remote-friendly', expectation: 'Async communication skills' }
  };

  const experienceGuidance: Record<string, { sectionOrder: string; focus: string }> = {
    fresher: { sectionOrder: 'Education → Projects → Skills', focus: 'Academic achievements, projects' },
    '1-3': { sectionOrder: 'Skills → Experience → Education', focus: 'First job impact, learning' },
    '3-5': { sectionOrder: 'Experience → Skills → Projects', focus: 'Ownership, team contributions' },
    '5-8': { sectionOrder: 'Experience → Leadership → Skills', focus: 'Leadership, business impact' },
    '8+': { sectionOrder: 'Executive Summary → Experience → Leadership', focus: 'Strategic vision, P&L' }
  };

  return {
    market: marketGuidance[market],
    experience: experienceGuidance[experience] || experienceGuidance['fresher']
  };
}

export function RoleMarketStep({ onComplete, initialData }: RoleMarketStepProps) {
  const [targetRole, setTargetRole] = useState(initialData?.targetRole || '');
  const [selectedRole, setSelectedRole] = useState<string | null>(initialData?.targetRole || null);
  const [targetMarket, setTargetMarket] = useState<TargetMarket>(initialData?.targetMarket || 'india');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialData?.experienceLevel || 'fresher'
  );
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [roleCorrection, setRoleCorrection] = useState<string | null>(null);
  const [roleCategoryFilter, setRoleCategoryFilter] = useState<string>('All');
  const [showEducation, setShowEducation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Filter and rank roles based on input with fuzzy matching - IMPROVED
  const filteredRoles = useMemo(() => {
    const base = targetRole.trim()
      ? getRoleSuggestions(targetRole, 30)
      : ROLE_TAXONOMY.slice(0, 30);
    const filtered = roleCategoryFilter === 'All'
      ? base
      : base.filter(role => categorizeRole(role) === roleCategoryFilter);
    return filtered.slice(0, 20);
  }, [targetRole, roleCategoryFilter]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowRoleSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation: Must select from suggestions
  const canContinue = selectedRole !== null && selectedRole.trim().length > 0;

  const handleRoleSelect = useCallback((role: string) => {
    setTargetRole(role);
    setSelectedRole(role);
    setShowRoleSuggestions(false);
    setValidationError(null);
    setRoleCorrection(null);
    setRoleCategoryFilter(categorizeRole(role));
  }, []);

  const handleUseCustomRole = useCallback((role: string) => {
    const clean = role.trim();
    if (!clean) return;
    saveCustomRole(clean);
    handleRoleSelect(clean);
  }, [handleRoleSelect]);

  const handleInputChange = useCallback((value: string) => {
    setTargetRole(value);
    setShowRoleSuggestions(value.trim().length > 0);
    setValidationError(null);

    // Auto-select if exact match found (case-insensitive)
    const exactMatch = ROLE_TAXONOMY.find(role =>
      role.toLowerCase() === value.trim().toLowerCase()
    );

    if (exactMatch) {
      setSelectedRole(exactMatch);
      setRoleCorrection(null);
      setRoleCategoryFilter(categorizeRole(exactMatch));
    } else {
      setSelectedRole(null); // Clear selection when typing
      setRoleCorrection(getRoleCorrection(value));
    }
  }, []);

  // Load market intelligence when role is selected
  const [intelligence, setIntelligence] = React.useState<any>(null);
  const [loadingIntel, setLoadingIntel] = React.useState(false);

  React.useEffect(() => {
    if (selectedRole && targetMarket && experienceLevel) {
      setLoadingIntel(true);
      import('../services/roleMarketIntelligenceService').then(({ getRoleMarketIntelligence }) => {
        return getRoleMarketIntelligence(selectedRole, targetMarket, experienceLevel);
      }).then(data => {
        setIntelligence(data);
        setLoadingIntel(false);
        // Store intelligence in context for later use
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('roleMarketIntelligence', JSON.stringify(data));
        }
      }).catch(err => {
        console.warn('Market intelligence load failed:', err);
        setLoadingIntel(false);
      });
    }
  }, [selectedRole, targetMarket, experienceLevel]);

  const handleSubmit = () => {
    if (!selectedRole) {
      setValidationError('Select a role from suggestions. We optimize resumes by role, not free text.');
      return;
    }
    const targetRoleCategory = categorizeRole(selectedRole);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('targetRoleCategory', targetRoleCategory);
    }
    onComplete({
      targetRole: selectedRole,
      targetMarket,
      experienceLevel,
      targetRoleCategory
    });
  };

  const guidance = getGuidanceContent(targetMarket, experienceLevel, selectedRole || '');

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',system-ui,sans-serif]">
      {/* Desktop: 2-column layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Column: Inputs */}
        <div className="flex-1 flex flex-col justify-center px-12 xl:px-20 max-w-2xl">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2 tracking-wide">STEP 1 OF 6</p>
              <h1 className="text-3xl font-semibold text-[#0F172A] tracking-tight">
                What role are you targeting?
              </h1>
              <p className="text-slate-500 mt-2">We'll structure your resume for this specific role and market.</p>
            </div>

            {/* Target Role - Searchable Combobox */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#0F172A]">Target Role</label>
              <div className="relative" ref={inputRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => setShowRoleSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredRoles.length > 0 && !selectedRole) {
                      e.preventDefault();
                      handleRoleSelect(filteredRoles[0]);
                    }
                  }}
                  placeholder="Type to search roles..."
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg text-[#0F172A] text-base
                    focus:outline-none focus:ring-2 transition-all
                    ${validationError
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : selectedRole
                        ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100 bg-emerald-50/30'
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                />
                {selectedRole && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}

                {roleCorrection && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleRoleSelect(roleCorrection);
                    }}
                    className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-semibold"
                  >
                    Did you mean {roleCorrection}?
                  </button>
                )}

                {/* Role suggestions dropdown */}
                {showRoleSuggestions && filteredRoles.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {filteredRoles.slice(0, 10).map((role, idx) => (
                      <button
                        key={role}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          handleRoleSelect(role);
                        }}
                        className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between gap-3 transition-colors
                          ${idx !== filteredRoles.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <span className="text-[#0F172A] text-sm font-medium">{role}</span>
                        {selectedRole === role && (
                          <Check className="w-4 h-4 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {ROLE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setRoleCategoryFilter(category);
                      setShowRoleSuggestions(true);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${roleCategoryFilter === category
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {targetRole.trim().length > 0 && !selectedRole && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleUseCustomRole(targetRole);
                  }}
                  className="mt-2 text-xs text-blue-600 font-semibold"
                >
                  Use "{targetRole}" as a custom role
                </button>
              )}
              {validationError && (
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              )}
              {selectedRole && (
                <p className="text-xs text-slate-500 mt-1">Category: {categorizeRole(selectedRole)}</p>
              )}
            </div>

            {/* Target Market - Segmented Control */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#0F172A]">Target Market</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {MARKET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTargetMarket(option.value)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                      ${targetMarket === option.value
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level - Radio Tiles */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#0F172A]">Experience Level</label>
              <div className="grid grid-cols-5 gap-2">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExperienceLevel(option.value as any)}
                    className={`py-3 px-1 rounded-lg border text-center transition-all
                      ${experienceLevel === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <div className="font-semibold text-[11px] leading-tight mb-1">{option.label}</div>
                    <div className="text-[10px] text-slate-500">{option.years}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              disabled={!canContinue}
              className={`w-full py-3.5 rounded-lg font-medium text-base flex items-center justify-center gap-2 transition-all
                ${canContinue
                  ? 'bg-[#0F172A] text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Guidance */}
        <div className="w-[400px] xl:w-[480px] bg-slate-50 border-l border-slate-200 p-10 flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A] mb-1">What we'll optimize</h2>
              <p className="text-sm text-slate-500">Based on your selections</p>
            </div>

            {/* Dynamic Guidance Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-[#0F172A]">Section Order</span>
                </div>
                <p className="text-sm text-slate-600 pl-11">{guidance.experience.sectionOrder}</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-medium text-[#0F172A]">Resume Focus</span>
                </div>
                <p className="text-sm text-slate-600 pl-11">{guidance.experience.focus}</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-medium text-[#0F172A]">Market Format</span>
                </div>
                <p className="text-sm text-slate-600 pl-11">{guidance.market.format} - {guidance.market.expectation}</p>
              </div>
            </div>

            {/* Market Intelligence Display */}
            {intelligence && !loadingIntel && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-blue-900 text-sm mb-2">Market Intelligence</h3>

                {intelligence.coreSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">Core Skills Expected:</p>
                    <div className="flex flex-wrap gap-1">
                      {intelligence.coreSkills.slice(0, 5).map((skill: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {intelligence.avoidClaims.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-700 mb-1">⚠️ Avoid These Claims:</p>
                    <ul className="text-xs text-amber-800 space-y-0.5">
                      {intelligence.avoidClaims.slice(0, 3).map((claim: string, i: number) => (
                        <li key={i}>• {claim}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {intelligence.appropriateTitles.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">✅ Appropriate Titles:</p>
                    <div className="flex flex-wrap gap-1">
                      {intelligence.appropriateTitles.slice(0, 3).map((title: string, i: number) => (
                        <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {loadingIntel && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600">Loading market intelligence...</p>
              </div>
            )}

            {/* Warning Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Wrong role = wrong structure.</span> We customize keywords, section order, and formatting based on your exact target.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Premium BW iOS */}
      <div className="lg:hidden min-h-screen bg-white flex flex-col font-sans">
        {/* iOS Header */}
        <div className="flex-none pt-12 pb-6 px-6 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex flex-col items-center">
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-6" />
          <div className="flex items-center justify-between w-full mb-6">
            <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Step 1 of 6</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 1 ? 'w-8 bg-black' : 'w-2 bg-gray-100'}`} />
              ))}
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-3xl font-black text-black tracking-tighter leading-tight">
              What role are you <br />targeting?
            </h1>
            <p className="text-[13px] font-medium text-gray-500 mt-2">
              Define your career path for AI optimization.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pt-8 pb-32 space-y-10 overflow-y-auto no-scrollbar">
          {/* Target Role Input */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Role</label>
            <div className="relative" ref={inputRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowRoleSuggestions(true)}
                placeholder="e.g. Software Engineer"
                className={`w-full h-14 pl-12 pr-12 bg-gray-50 border-none rounded-2xl text-[16px] font-bold text-black placeholder:text-gray-300 focus:ring-2 focus:ring-black/5 transition-all`}
              />
              {selectedRole && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {showRoleSuggestions && filteredRoles.length > 0 && (
                <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-ios-lg border border-gray-100 overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-top-2">
                  {filteredRoles.slice(0, 10).map((role, idx) => (
                    <button
                      key={role}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleRoleSelect(role);
                      }}
                      className={`w-full px-6 py-4 text-left active:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-none`}
                    >
                      <span className="text-black text-[14px] font-bold">{role}</span>
                      {selectedRole === role && <Check size={16} className="text-black" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Market Selection */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Execution Market</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {MARKET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTargetMarket(option.value)}
                  className={`h-11 px-6 rounded-full border-2 whitespace-nowrap text-sm font-bold transition-all
                    ${targetMarket === option.value
                      ? 'bg-black border-black text-white shadow-ios-sm'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Grid - Matching User Screenshot but Premium */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience Level</label>
            <div className="space-y-2.5">
              {EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExperienceLevel(option.value as any)}
                  className={`w-full h-16 px-6 rounded-2xl border transition-all flex items-center justify-between active:scale-[0.98]
                    ${experienceLevel === option.value
                      ? 'bg-black border-black text-white shadow-ios-md'
                      : 'bg-white border-gray-100 text-black shadow-ios-sm'
                    }`}
                >
                  <span className={`text-[16px] font-bold ${experienceLevel === option.value ? 'text-white' : 'text-black'}`}>
                    {option.label}
                  </span>
                  <span className={`text-[12px] font-medium transition-colors ${experienceLevel === option.value ? 'text-gray-400' : 'text-gray-400'}`}>
                    {option.years}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100/50">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={16} className="text-black" />
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">AI Optimization</h3>
            </div>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">
              Matching keywords for <span className="text-black font-bold">{selectedRole || 'your role'}</span> in the <span className="text-black font-bold">{targetMarket}</span> market.
            </p>
          </div>
        </div>

        {/* Sticky iOS CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-3xl border-t border-gray-100 z-[100] safe-area-bottom">
          <button
            onClick={handleSubmit}
            disabled={!canContinue}
            className={`w-full h-16 rounded-2xl font-black text-[16px] flex items-center justify-center gap-3 transition-all
              ${canContinue
                ? 'bg-black text-white shadow-ios-lg active:scale-[0.97]'
                : 'bg-gray-100 text-gray-300'
              }`}
          >
            <span>Continue to Build</span>
            <ArrowRight size={20} strokeWidth={4} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleMarketStep;
