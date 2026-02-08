import React from 'react';
import { ResumeData } from '../../../core/types';

interface AdditionalSectionProps {
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
}

export const AdditionalSection: React.FC<AdditionalSectionProps> = ({ data, onChange }) => {
    const achievements = data.achievements || [];

    const updateAchievement = (index: number, value: string) => {
        const newAch = [...achievements];
        newAch[index] = value;
        onChange({ achievements: newAch });
    };

    const addAchievement = () => {
        onChange({
            achievements: [...achievements, '']
        });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Achievements</h2>
                <button onClick={addAchievement} className="px-3 py-1 bg-blue-600 text-white rounded">+ Add</button>
            </div>
            {achievements.map((ach, index) => (
                <div key={index} className="border p-4 rounded space-y-2">
                    <textarea
                        placeholder="Description"
                        value={ach}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        className="w-full border p-2 rounded h-16"
                    />
                </div>
            ))}
        </div>
    );
};
