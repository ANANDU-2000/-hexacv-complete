import React, { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { TabId } from './sectionCompletion';
import { getCompletionIcon } from './sectionCompletion';

export type SectionCompletionMap = Partial<Record<TabId, 'done' | 'partial' | 'empty'>>;

interface EditorLayoutProps {
  children: ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  sectionCompletion?: SectionCompletionMap;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'target-jd', label: 'Target Role' },
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
      {/* Horizontal top navigation tabs - sticky, no left sidebar */}
      <nav
        className="shrink-0 sticky top-0 z-40 bg-white border-b border-gray-200 overflow-x-auto"
        aria-label="Section navigation"
      >
        <div className="flex gap-0 min-w-max px-2 py-1">
          {TABS.map((tab) => {
            const state = sectionCompletion[tab.id] ?? 'empty';
            const icon = getCompletionIcon(state);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors
                  ${isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${tab.label}${state === 'done' ? ', Complete' : state === 'partial' ? ', Incomplete' : ''}`}
              >
                <span className="text-xs w-4 text-left" aria-hidden>{icon}</span>
                {tab.label}
                {isActive && <ChevronDown size={14} className="text-blue-600 opacity-70" aria-hidden />}
              </button>
            );
          })}
        </div>
      </nav>
      {/* Single open section content - accordion style: only active section visible */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 editor-form-spacing">
          {children}
        </div>
      </main>
    </div>
  );
};
