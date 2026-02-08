import React, { ReactNode } from 'react';
import { TabId } from './sectionCompletion';
import { getCompletionIcon } from './sectionCompletion';

export type SectionCompletionMap = Partial<Record<TabId, 'done' | 'partial' | 'empty'>>;

interface EditorLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sectionCompletion?: SectionCompletionMap;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'target-jd', label: 'Target & JD' },
  { id: 'profile', label: 'Profile' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'achievements', label: 'Achievements' },
];

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  sectionCompletion = {},
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <nav className="w-56 bg-white border-r overflow-y-auto flex-shrink-0" aria-label="Sections">
          {TABS.map((tab) => {
            const state = sectionCompletion[tab.id] ?? 'empty';
            const icon = getCompletionIcon(state);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full text-left px-4 py-3 font-medium flex items-center gap-2 ${isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${tab.label}${state === 'done' ? ', Complete' : state === 'partial' ? ', Incomplete' : ''}`}
              >
                <span className="text-sm w-5 text-left" aria-hidden>{icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>
        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
