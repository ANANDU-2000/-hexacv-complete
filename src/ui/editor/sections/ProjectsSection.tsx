import React from 'react';
import { ResumeData } from '../../../core/types';

interface ProjectsSectionProps {
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ data, onChange }) => {
    const projects = data.projects || [];

    const updateProject = (index: number, field: string, value: any) => {
        const newProj = [...projects];
        newProj[index] = { ...newProj[index], [field]: value };
        onChange({ projects: newProj });
    };

    const addProject = () => {
        onChange({
            projects: [
                ...projects,
                { id: Date.now().toString(), name: '', description: '', highlights: [] }
            ]
        });
    };

    return (
        <div className="space-y-4 p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Projects</h2>
                <button onClick={addProject} className="px-3 py-1 bg-blue-600 text-white rounded">+ Add</button>
            </div>
            {projects.map((proj, index) => (
                <div key={proj.id || index} className="border p-4 rounded space-y-2">
                    <input
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    <textarea
                        placeholder="Description"
                        value={proj.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        className="w-full border p-2 rounded h-20"
                    />
                </div>
            ))}
        </div>
    );
};
