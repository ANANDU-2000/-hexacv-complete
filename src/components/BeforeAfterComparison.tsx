/**
 * BEFORE/AFTER COMPARISON COMPONENT
 * 
 * Shows users the impact difference between free and AI-enhanced templates
 * This is the KEY conversion driver for paid templates
 * 
 * Shows:
 * - Original weak bullet (Before)
 * - AI-improved bullet (After)
 * - What was improved (metrics, keywords, action verbs)
 */

import React from 'react';
import { ArrowRight, Sparkles, Check, X, TrendingUp } from 'lucide-react';

interface BeforeAfterExample {
    before: string;
    after: string;
    improvements: string[];
}

const ROLE_EXAMPLES: Record<string, BeforeAfterExample[]> = {
    'Software Engineer': [
        {
            before: "Worked on AI projects using Python",
            after: "Built RAG-based AI systems using LangChain and FAISS, improving document retrieval accuracy by 42%",
            improvements: ["Added specific technologies", "Quantified impact", "Strong action verb"]
        },
        {
            before: "Developed web applications",
            after: "Developed 3 production React applications serving 10K+ daily users with 99.9% uptime",
            improvements: ["Added scale metrics", "Specific technology", "Availability metric"]
        },
        {
            before: "Fixed bugs and improved code",
            after: "Reduced production bugs by 35% through implementation of comprehensive unit testing with Jest",
            improvements: ["Quantified improvement", "Specific approach", "Named tool"]
        }
    ],
    'Data Scientist': [
        {
            before: "Built machine learning models",
            after: "Developed predictive ML models using XGBoost achieving 94% accuracy on customer churn prediction",
            improvements: ["Specific algorithm", "Accuracy metric", "Business context"]
        },
        {
            before: "Analyzed data and created reports",
            after: "Analyzed 2M+ customer records using Python/Pandas, delivering insights that increased retention by 18%",
            improvements: ["Data scale", "Tools used", "Business impact"]
        }
    ],
    'Product Manager': [
        {
            before: "Managed product features and roadmap",
            after: "Led product roadmap for B2B SaaS platform, delivering 12 features that drove 25% revenue increase",
            improvements: ["Product type", "Feature count", "Revenue impact"]
        },
        {
            before: "Worked with engineering teams",
            after: "Collaborated with 8-member engineering team using Agile, reducing sprint cycle time by 30%",
            improvements: ["Team size", "Methodology", "Efficiency metric"]
        }
    ],
    'default': [
        {
            before: "Responsible for team projects",
            after: "Led 4-member cross-functional team to deliver project 2 weeks ahead of schedule",
            improvements: ["Team size", "Specific outcome", "Timeline improvement"]
        },
        {
            before: "Improved processes and efficiency",
            after: "Streamlined workflow process, reducing task completion time by 40% and saving 15 hours/week",
            improvements: ["Specific metric", "Time saved", "Quantified impact"]
        },
        {
            before: "Handled customer issues",
            after: "Resolved 50+ customer issues weekly, maintaining 95% satisfaction score",
            improvements: ["Volume handled", "Quality metric", "Consistency"]
        }
    ]
};

interface BeforeAfterComparisonProps {
    targetRole?: string;
    showAll?: boolean;
}

export default function BeforeAfterComparison({ targetRole, showAll = false }: BeforeAfterComparisonProps) {
    // Get examples for the role, or use default
    const roleKey = Object.keys(ROLE_EXAMPLES).find(
        key => targetRole?.toLowerCase().includes(key.toLowerCase())
    ) || 'default';
    
    const examples = ROLE_EXAMPLES[roleKey];
    const displayExamples = showAll ? examples : examples.slice(0, 2);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="font-bold text-slate-900">See the AI Difference</h3>
            </div>

            {displayExamples.map((example, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    {/* Before */}
                    <div className="p-4 bg-red-50 border-b border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <X size={14} className="text-red-500" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Before (Weak)</span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">• {example.before}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center py-2 bg-slate-50">
                        <ArrowRight size={16} className="text-slate-400" />
                    </div>

                    {/* After */}
                    <div className="p-4 bg-emerald-50">
                        <div className="flex items-center gap-2 mb-2">
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">After (AI Enhanced)</span>
                        </div>
                        <p className="text-sm text-slate-900 font-medium">• {example.after}</p>
                        
                        {/* Improvements */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {example.improvements.map((imp, i) => (
                                <span 
                                    key={i}
                                    className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium"
                                >
                                    + {imp}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Compact version for template cards
 */
export function BeforeAfterCompact({ targetRole }: { targetRole?: string }) {
    const roleKey = Object.keys(ROLE_EXAMPLES).find(
        key => targetRole?.toLowerCase().includes(key.toLowerCase())
    ) || 'default';
    
    const example = ROLE_EXAMPLES[roleKey][0];

    return (
        <div className="bg-gradient-to-r from-red-50 to-emerald-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Sample Improvement</span>
                <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <div className="space-y-1.5">
                <p className="text-xs text-red-600 line-through">• {example.before.slice(0, 40)}...</p>
                <p className="text-xs text-emerald-700 font-medium">• {example.after.slice(0, 60)}...</p>
            </div>
        </div>
    );
}

/**
 * Value proposition list for paid template
 */
export function PaidTemplateValue() {
    const benefits = [
        { text: "JD keywords naturally added", icon: Check },
        { text: "Weak bullets rewritten", icon: Check },
        { text: "Metrics & impact added", icon: Check },
        { text: "Recruiter scan optimized", icon: Check },
        { text: "No fake skills added", icon: Check },
    ];

    return (
        <div className="space-y-2">
            {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <benefit.icon size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{benefit.text}</span>
                </div>
            ))}
        </div>
    );
}
