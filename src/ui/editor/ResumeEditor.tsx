import React, { useState, useMemo } from 'react';
import { ResumeData } from '../../core/types';
import { EditorLayout } from './EditorLayout';
import { getSectionCompletion, type TabId } from './sectionCompletion';
import { TargetJDSection } from './sections/TargetJDSection';
import { ProfileSection } from './sections/ProfileSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { EducationSection } from './sections/EducationSection';
import { AdditionalSection } from './sections/AdditionalSection';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<TabId>('target-jd');
  const sectionCompletion = useMemo(() => getSectionCompletion(data), [data]);

  const handlePartialChange = (partial: Partial<ResumeData>) => {
    onChange({ ...data, ...partial });
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'target-jd': return <TargetJDSection data={data} onChange={handlePartialChange} />;
      case 'profile': return <ProfileSection data={data} onChange={handlePartialChange} />;
      case 'experience': return <ExperienceSection data={data} onChange={handlePartialChange} />;
      case 'projects': return <ProjectsSection data={data} onChange={handlePartialChange} />;
      case 'skills': return <SkillsSection data={data} onChange={handlePartialChange} />;
      case 'education': return <EducationSection data={data} onChange={handlePartialChange} />;
      case 'achievements': return <AdditionalSection data={data} onChange={handlePartialChange} />;
      default: return <div>Select a section</div>;
    }
  };

  return (
    <EditorLayout activeTab={activeTab} onTabChange={setActiveTab} sectionCompletion={sectionCompletion}>
      {renderActiveSection()}
    </EditorLayout>
  );
};

