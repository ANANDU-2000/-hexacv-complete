import React from 'react';
import type { DocumentBlock } from './types';
import { ResumeHeaderBlock } from './ResumeHeaderBlock';
import { SummaryBlock } from './SummaryBlock';
import { SectionTitle } from './SectionTitle';
import { ExperienceItemBlock } from './ExperienceItemBlock';
import { SkillsCategoryBlock } from './SkillsCategoryBlock';
import { ProjectItemBlock } from './ProjectItemBlock';
import { EducationItemBlock } from './EducationItemBlock';

export type { DocumentBlock };
export { resumeToBlocks } from './types';

export function renderBlock(block: DocumentBlock): React.ReactNode {
  switch (block.type) {
    case 'header':
      return <ResumeHeaderBlock key="header" data={block.data} />;
    case 'summary':
      return <SummaryBlock key="summary" text={block.text} />;
    case 'sectionTitle':
      return <SectionTitle key={`title-${block.title}`} title={block.title} />;
    case 'skillsCategory':
      return <SkillsCategoryBlock key={`skill-${block.data.category}`} data={block.data} />;
    case 'experience':
      return <ExperienceItemBlock key={block.data.id || `exp-${block.data.company}-${block.data.role}`} data={block.data} />;
    case 'project':
      return <ProjectItemBlock key={block.data.id || `proj-${block.data.title}`} data={block.data} />;
    case 'education':
      return <EducationItemBlock key={block.data.id || `edu-${block.data.institute}`} data={block.data} />;
    default:
      return null;
  }
}
