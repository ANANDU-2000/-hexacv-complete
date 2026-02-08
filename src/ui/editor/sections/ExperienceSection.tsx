import React from 'react';
import { ResumeData } from '../../../core/types';

interface ExperienceSectionProps {
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ data, onChange }) => {
    const experiences = data.experience || [];

    const updateExperience = (index: number, field: string, value: any) => {
        const newExp = [...experiences];
        newExp[index] = { ...newExp[index], [field]: value };
        onChange({ experience: newExp });
    };

    const addExperience = () => {
        onChange({
            experience: [
                ...experiences,
                { id: Date.now().toString(), company: '', position: '', startDate: '', endDate: '', highlights: [] }
            ]
        });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Experience</h2>
                <button onClick={addExperience} className="px-3 py-1 bg-blue-600 text-white rounded">+ Add</button>
            </div>
            {experiences.map((exp, index) => (
                <div key={exp.id || index} className="border p-4 rounded space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            className="border p-2 rounded"
                        />
                        <input
                            placeholder="Position"
                            value={exp.position}
                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                            className="border p-2 rounded"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
