import React, { useEffect, useState, useRef } from 'react';
import { ResumeData, TemplateConfig } from '../../types';
import { A4_HEIGHT, A4_WIDTH, TEMPLATES } from '../../constants';
import { TemplateRenderer } from '../../template-renderer';
import { getTemplateColors } from '../../utils/templateColors';
import FeedbackPopup from '../FeedbackPopup';
import PaymentSuccessPopup from '../PaymentSuccessPopup';
import { ArrowLeft, Check, Eye, ChevronRight, Sparkles } from 'lucide-react';

interface MobileTemplateExportProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    templates?: TemplateConfig[];
    onSelect: (template: TemplateConfig) => void;
    onBack: () => void;
    onNext: () => void;
    onDataChange?: (data: ResumeData) => void;
    onGoToHomepage?: () => void;
    hideHeader?: boolean;
}

const MobileTemplateExport: React.FC<MobileTemplateExportProps> = ({
    data,
    selectedTemplate,
    templates = TEMPLATES,
    onSelect,
    onBack,
    onNext,
    hideHeader = false
}) => {
    const [processing, setProcessing] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [purchasedTemplate, setPurchasedTemplate] = useState<TemplateConfig | null>(null);
    const [activeColor, setActiveColor] = useState<string>('#1A1C21');
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);
    const [isResumeIncomplete, setIsResumeIncomplete] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const sliderRef = useRef<HTMLDivElement>(null);
    const availableTemplates = templates;

    useEffect(() => {
        if (selectedTemplate) {
            const colors = getTemplateColors(selectedTemplate.id);
            const firstColor = Object.values(colors)[0];
            if (firstColor) setActiveColor(firstColor);

            // Sync index if selected externally
            const index = availableTemplates.findIndex(t => t.id === selectedTemplate.id);
            if (index !== -1 && index !== activeIndex) {
                setActiveIndex(index);
                scrollToIndex(index);
            }
        }
    }, [selectedTemplate]);

    useEffect(() => {
        const checkIncomplete = () => {
            const hasExperience = data.experience && data.experience.length > 0;
            const hasEducation = data.education && data.education.length > 0;
            const hasSkills = data.skills && data.skills.length > 0;
            setIsResumeIncomplete(!(hasExperience && hasEducation && hasSkills));
        };
        checkIncomplete();
    }, [data]);

    const handleSliderScroll = () => {
        if (!sliderRef.current) return;
        const scrollLeft = sliderRef.current.scrollLeft;
        const cardWidth = sliderRef.current.offsetWidth * 0.85; // 85% width of container
        const index = Math.round(scrollLeft / cardWidth);
        if (index !== activeIndex && index >= 0 && index < availableTemplates.length) {
            setActiveIndex(index);
            onSelect(availableTemplates[index]);
        }
    };

    const scrollToIndex = (index: number) => {
        if (!sliderRef.current) return;
        const cardWidth = sliderRef.current.offsetWidth * 0.85;
        sliderRef.current.scrollTo({
            left: index * cardWidth,
            behavior: 'smooth'
        });
    };

    // Role-level specific content for AI preview
    enum RoleLevel {
        ENTRY = 'ENTRY',
        MID = 'MID',
        SENIOR = 'SENIOR',
        EXECUTIVE = 'EXECUTIVE'
    }

    const detectRoleLevel = (resumeData: ResumeData): RoleLevel => {
        const expCount = resumeData.experience?.length || 0;
        if (expCount >= 8) return RoleLevel.EXECUTIVE;
        if (expCount >= 5) return RoleLevel.SENIOR;
        if (expCount >= 2) return RoleLevel.MID;
        return RoleLevel.ENTRY;
    };

    const extractKeywords = (text: string): string[] => {
        const commonKeywords = [
            'strategy', 'leadership', 'ROI', 'optimization', 'architecture',
            'agile', 'stakeholder', 'cross-functional', 'revenue', 'scalability',
            'deployment', 'integration', 'solutions', 'framework', 'metrics'
        ];
        return commonKeywords.filter(k =>
            text.toLowerCase().includes(k.toLowerCase())
        );
    };

    const getRoleLevelPatterns = (level: RoleLevel) => {
        switch (level) {
            case RoleLevel.EXECUTIVE:
                return {
                    prefix: "Orchestrated",
                    structure: (action: string, tech: string) =>
                        `${action} high-impact ${tech} initiatives driving $1.2M in annual efficiency gains across global divisions.`,
                    impactTypes: ["Strategic Alignment", "Capital Optimization", "Visionary Leadership"]
                };
            case RoleLevel.SENIOR:
                return {
                    prefix: "Architected",
                    structure: (action: string, tech: string) =>
                        `${action} scalable ${tech} frameworks resulting in a 35% reduction in technical debt and Go-to-Market latency.`,
                    impactTypes: ["Infrastructure Design", "Team Mentorship", "Operational Excellence"]
                };
            case RoleLevel.MID:
                return {
                    prefix: "Spearheaded",
                    structure: (action: string, tech: string) =>
                        `${action} cross-functional ${tech} projects to optimize lifecycle management and deliver 20%+ performance uplift.`,
                    impactTypes: ["Agile Management", "Data-Driven Results", "Product Refinement"]
                };
            default:
                return {
                    prefix: "Implemented",
                    structure: (action: string, tech: string) =>
                        `${action} automated ${tech} protocols to streamline workflows and improve individual output by 15%.`,
                    impactTypes: ["Process Automation", "Skill Acquisition", "Task Efficiency"]
                };
        }
    };

    const rewriteBulletContextAware = (bullet: string, roleLevel: RoleLevel, allKeywords: string[]): string => {
        if (!bullet || bullet.length < 5) return "Strategically optimized core operational workflows to maximize organizational output and ROI.";
        const patterns = getRoleLevelPatterns(roleLevel);
        const keywords = extractKeywords(bullet);
        const focusTech = keywords.length > 0 ? keywords[0] : (allKeywords.length > 0 ? allKeywords[0] : "enterprise");
        return patterns.structure(patterns.prefix, focusTech);
    };

    const handleDownload = (template: TemplateConfig) => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setShowFeedbackPopup(true);
        }, 2000);
    };

    const handleFeedbackSubmit = (feedback: { rating: number; message: string; userName: string }) => {
        console.log('Feedback submitted:', feedback);
        setShowFeedbackPopup(false);
    };

    const getUserFirstBullet = (): string => {
        if (data.experience && data.experience[0]?.highlights?.length > 0) {
            return data.experience[0].highlights[0];
        }
        return "Worked on various software development projects.";
    };

    const getAIRewrittenBullet = (): string => {
        const bullet = getUserFirstBullet();
        const roleLevel = detectRoleLevel(data);
        const keywords = extractKeywords(JSON.stringify(data));
        return rewriteBulletContextAware(bullet, roleLevel, keywords);
    };

    const calculateATSMetrics = () => {
        const roleLevel = detectRoleLevel(data);
        const scoreBase = roleLevel === RoleLevel.EXECUTIVE ? 94 : roleLevel === RoleLevel.SENIOR ? 91 : 88;
        return {
            original: { score: 64, keywords: 12 },
            rewritten: { score: scoreBase, keywords: 28 },
            improvements: { scoreGain: scoreBase - 64, keywordsAdded: 16, metricsAdded: 8 }
        };
    };

    const atsMetrics = calculateATSMetrics();
    const handleFullscreenPageCountChange = (count: number) => {
        console.log("Pages:", count);
    };
    const handleCloseDetails = () => setExpandedDetailsId(null);

    return (
        <div className="h-[100dvh] flex flex-col bg-[#F8F9FB] overflow-hidden select-none font-sans">
            {/* 📌 Header Area */}
            {!hideHeader && (
                <div className="sticky top-0 z-[60] px-4 pt-12 pb-5 bg-white backdrop-blur-xl border-b border-gray-100/60 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-200/50 transition-all text-[#1A1C21]"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight text-[#1A1C21]">Choose Template</h1>
                    </div>
                    <button
                        onClick={() => handleDownload(selectedTemplate)}
                        disabled={processing || isResumeIncomplete}
                        className="h-10 px-5 bg-[#1A1C21] active:bg-black text-white text-[13px] font-bold rounded-full shadow-lg shadow-[#1A1C21]/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Download</span>
                                <Check size={16} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* 🎯 Template Slider (Card Carousel Section) */}
            <div className="flex-1 flex flex-col items-center justify-center pt-4 overflow-hidden">
                <div
                    ref={sliderRef}
                    onScroll={handleSliderScroll}
                    className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8"
                    style={{ scrollPadding: '0 7.5%' }}
                >
                    {/* Padding for first card center alignment */}
                    <div className="flex-none w-[7.5%]" />

                    {availableTemplates.map((template, index) => {
                        const isSelected = selectedTemplate.id === template.id;
                        const templatePrice = (template as any).finalPrice ?? template.price ?? 0;
                        const isFree = templatePrice === 0;
                        const templateColors = getTemplateColors(template.id);

                        // Scale factors for preview
                        const cardWidth = window.innerWidth * 0.85;
                        const scale = (cardWidth / A4_WIDTH) * 0.88;

                        return (
                            <div
                                key={template.id}
                                className="flex-none w-[85%] snap-center px-3"
                                onClick={() => {
                                    onSelect(template);
                                    scrollToIndex(index);
                                }}
                            >
                                <div className={`relative bg-white rounded-[24px] overflow-hidden transition-all duration-500 will-change-transform ${isSelected
                                        ? 'scale-[1.03] shadow-[0_20px_40px_rgba(37,99,235,0.12)] border-2 border-[#2563EB]/40 opacity-100 z-10'
                                        : 'scale-[0.96] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-2 border-transparent opacity-60'
                                    }`}>
                                    {/* 🧩 Template Preview Area */}
                                    <div className="relative w-full h-[240px] bg-white overflow-hidden border-b border-gray-50">
                                        <div
                                            className="absolute left-1/2 top-4 origin-top pointer-events-none"
                                            style={{
                                                width: `${A4_WIDTH}px`,
                                                height: `${A4_HEIGHT}px`,
                                                transform: `translateX(-50%) scale(${scale})`
                                            }}
                                        >
                                            <TemplateRenderer
                                                templateId={template.id}
                                                resumeData={data}
                                                currentPage={1}
                                            />
                                        </div>

                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4 z-40">
                                            <div className={`px-2.5 py-1.2 rounded-full text-[9px] font-black tracking-widest shadow-md backdrop-blur-md ${isFree ? 'bg-emerald-500 text-white' : 'bg-[#1A1C21] text-white'
                                                }`}>
                                                {isFree ? 'FREE' : `PREMIUM`}
                                            </div>
                                        </div>

                                        {/* Eye Action */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowFullscreen(true); onSelect(template); }}
                                            className="absolute top-4 right-4 z-40 w-10 h-10 bg-white/90 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-[#1A1C21] shadow-lg active:scale-90 transition-all"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>

                                    {/* Card Content Section */}
                                    <div className="p-5 space-y-4 bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-[#1A1C21] text-lg font-bold tracking-tight">
                                                    {template.name}
                                                </h2>
                                                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                                                    {isFree ? 'Classic · Starter' : 'Premium · Advanced'}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center text-white">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Color Chips */}
                                        <div className="flex items-center gap-2.5">
                                            {Object.entries(templateColors).slice(0, 5).map(([name, color]) => (
                                                <button
                                                    key={name}
                                                    onClick={(e) => { e.stopPropagation(); setActiveColor(color); }}
                                                    className={`w-7 h-7 rounded-full transition-all duration-300 relative ${activeColor === color && isSelected
                                                            ? 'ring-2 ring-offset-2 ring-[#1A1C21] scale-110'
                                                            : 'hover:scale-105'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {activeColor === color && isSelected && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className={`w-1 h-1 rounded-full ${color === '#FFFFFF' ? 'bg-black' : 'bg-white'}`} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Detail CTA */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setExpandedDetailsId(template.id); onSelect(template); }}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FB] active:bg-gray-100 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={16} className="text-[#2563EB] opacity-60" />
                                                <span className="text-xs font-semibold text-[#1A1C21]">Show More Details</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-active:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Padding for last card center alignment */}
                    <div className="flex-none w-[7.5%]" />
                </div>

                {/* Pagination Dots */}
                <div className="flex gap-1.5 mt-2 mb-8">
                    {availableTemplates.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 transition-all duration-300 rounded-full ${activeIndex === i ? 'w-4 bg-[#2563EB]' : 'w-1.5 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* ⬇ Bottom Action Area */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 z-[70] safe-area-bottom">
                <button
                    onClick={onNext}
                    className="w-full h-14 rounded-full bg-[#1A1C21] text-white font-bold text-sm uppercase tracking-wider active:scale-[0.97] transition-all shadow-xl flex items-center justify-center gap-2"
                >
                    <span>Continue to Live Preview</span>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* AI Insights Modal */}
            {expandedDetailsId && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
                    <div className="flex-none px-6 pt-14 pb-6 flex items-center justify-between bg-white border-b border-gray-50">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-[#1A1C21]">AI Insights</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Smart Optimization</p>
                        </div>
                        <button
                            onClick={handleCloseDetails}
                            className="w-12 h-12 rounded-full bg-[#F8F9FB] flex items-center justify-center text-[#1A1C21] active:scale-90 transition-all font-light"
                        >
                            <ArrowLeft size={24} className="-rotate-90" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 pb-40">
                        <div className="bg-[#1A1C21] rounded-[32px] p-8 text-white relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 opacity-10">
                                <Sparkles size={160} />
                            </div>
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10">ATS Compatibility</h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-6xl font-black">{atsMetrics.rewritten.score}%</div>
                                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase">
                                        <div className="w-1 h-3 bg-emerald-400 rounded-full" />
                                        <span>+{atsMetrics.improvements.scoreGain}% Increase</span>
                                    </div>
                                </div>
                                <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center">
                                    <Sparkles size={32} className="text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[#1A1C21] font-black text-lg">Evolution</h3>
                                <div className="px-3 py-1 bg-blue-50 text-[#2563EB] text-[9px] font-black uppercase tracking-widest rounded-full">AI Rewrite</div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-[#F8F9FB] border border-gray-100 rounded-[20px]">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Initial Draft</span>
                                    <p className="text-gray-400 text-[13px] font-medium leading-relaxed italic">"{getUserFirstBullet()}"</p>
                                </div>

                                <div className="p-6 bg-white border-2 border-[#1A1C21] rounded-[24px] shadow-xl shadow-black/5">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Optimized</span>
                                    <p className="text-[#1A1C21] text-[15px] font-bold leading-[1.6]">
                                        {getAIRewrittenBullet()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F8F9FB] rounded-[24px] p-6 border border-gray-100">
                                <div className="text-[#2563EB] font-black text-3xl">+{atsMetrics.improvements.metricsAdded}</div>
                                <div className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">Metrics</div>
                            </div>
                            <div className="bg-[#F8F9FB] rounded-[24px] p-6 border border-gray-100">
                                <div className="text-[#1A1C21] font-black text-3xl">+{atsMetrics.improvements.keywordsAdded}</div>
                                <div className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">SEO Keys</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white backdrop-blur-xl border-t border-gray-50 fixed bottom-0 left-0 right-0 z-[110]">
                        <button
                            onClick={handleCloseDetails}
                            className="w-full h-15 bg-[#1A1C21] text-white rounded-full font-black text-[13px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Back to Gallery
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .font-sans { font-family: 'Inter', sans-serif; }
                .safe-area-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .h-15 { height: 3.75rem; }
            `}</style>

            {showFullscreen && (
                <div className="fixed inset-0 z-[1000] bg-[#F8F9FB] flex flex-col animate-in fade-in duration-300">
                    <div className="flex-none h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 flex items-center justify-between pt-6">
                        <div className="flex flex-col">
                            <h2 className="font-extrabold text-[#1A1C21] text-lg">{selectedTemplate.name}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Full Preview Mode</p>
                        </div>
                        <button
                            onClick={() => setShowFullscreen(false)}
                            className="w-10 h-10 rounded-full bg-[#F8F9FB] flex items-center justify-center text-[#1A1C21] active:scale-90 transition-all font-light"
                        >
                            <ArrowLeft size={20} className="-rotate-90" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#F8F9FB]">
                        <div className="origin-top my-4 shadow-[0_40px_80px_rgba(0,0,0,0.1)] bg-white rounded-xl overflow-hidden" style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.38)' }}>
                            <TemplateRenderer
                                templateId={selectedTemplate.id}
                                resumeData={data}
                                currentPage={1}
                                onPageCountChange={handleFullscreenPageCountChange}
                            />
                        </div>
                    </div>
                    <div className="flex-none p-6 bg-white border-t border-gray-100 safe-area-bottom">
                        <button
                            onClick={() => handleDownload(selectedTemplate)}
                            className="w-full h-15 bg-[#1A1C21] text-white rounded-full font-black text-[14px] uppercase tracking-widest active:scale-95 transition-all shadow-2xl"
                        >
                            Finalize & Download
                        </button>
                    </div>
                </div>
            )}

            {showFeedbackPopup && (
                <FeedbackPopup isOpen={showFeedbackPopup} onClose={() => setShowFeedbackPopup(false)} onSubmit={handleFeedbackSubmit} templateName={selectedTemplate.name} />
            )}
            {showPaymentSuccess && purchasedTemplate && (
                <PaymentSuccessPopup isOpen={showPaymentSuccess} onClose={() => setShowPaymentSuccess(false)} onDownload={() => handleDownload(purchasedTemplate)} templateName={purchasedTemplate.name} amount={purchasedTemplate.price ?? 0} />
            )}
        </div>
    );
};

export default MobileTemplateExport;
