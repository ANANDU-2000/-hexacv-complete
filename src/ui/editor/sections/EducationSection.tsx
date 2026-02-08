import React from 'react';
import { ResumeData } from '../../../core/types';

interface EducationSectionProps {
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ data, onChange }) => {
    const education = data.education || [];

    const updateEducation = (index: number, field: string, value: any) => {
        const newEdu = [...education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        onChange({ education: newEdu });
    };

    const addEducation = () => {
        onChange({
            education: [
                ...education,
                { id: Date.now().toString(), institution: '', degree: '', year: '' }
            ]
        });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Education</h2>
                <button onClick={addEducation} className="px-3 py-1 bg-blue-600 text-white rounded">+ Add</button>
            </div>
            {education.map((edu, index) => (
                <div key={edu.id || index} className="border p-4 rounded space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            placeholder="Institution"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <input
                        placeholder="Year"
                        value={edu.year || edu.graduationDate || ''}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
            ))}
        </div>
    );
};
