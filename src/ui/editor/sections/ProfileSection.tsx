import React from 'react';
import { ResumeData } from '../../../core/types';

interface ProfileSectionProps {
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ data, onChange }) => {
    const basics = data.basics;

    const handleChange = (field: string, value: string) => {
        onChange({
            basics: { ...basics, [field]: value }
        });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input
                        type="text"
                        value={basics.fullName || ''}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={basics.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                        type="text"
                        value={basics.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input
                        type="text"
                        value={basics.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium">Summary</label>
                    <textarea
                        value={data.summary || ''}
                        onChange={(e) => onChange({ summary: e.target.value })}
                        className="w-full border p-2 rounded h-32"
                    />
                </div>
            </div>
        </div>
    );
};
