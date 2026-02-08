import React from 'react';
import { ResumeData } from '../../../core/types';

interface SkillsSectionProps {
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ data, onChange }) => {
    const skills = data.skills || [];

    const handleChange = (value: string) => {
        // Simple comma-separated for now, or array of strings
        onChange({ skills: value.split(',').map(s => s.trim()) });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold">Skills</h2>
            <p className="text-sm text-gray-600">Enter skills separated by commas</p>
            <textarea
                value={skills.join(', ')}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full border p-2 rounded h-24"
            />
        </div>
    );
};
