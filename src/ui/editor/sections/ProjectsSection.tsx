import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResumeData } from '../../../core/types';

interface ProjectsSectionProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ data, onChange }) => {
  const projects = data.projects || [];
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const updateProject = (index: number, field: string, value: unknown) => {
    const newProj = [...projects];
    newProj[index] = { ...newProj[index], [field]: value };
    onChange({ projects: newProj });
  };

  const addProject = () => {
    const next = [...projects, { id: Date.now().toString(), name: '', description: '', highlights: [] }];
    onChange({ projects: next });
    setExpandedIndex(next.length - 1);
  };

  const removeProject = (index: number) => {
    const next = projects.filter((_, i) => i !== index);
    onChange({ projects: next });
    if (expandedIndex >= next.length && next.length > 0) setExpandedIndex(next.length - 1);
    else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  const itemIds = projects.map((p, i) => p.id || `proj-${i}`);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(projects, oldIndex, newIndex);
    onChange({ projects: reordered });
    setExpandedIndex((prev) => {
      if (prev === oldIndex) return newIndex;
      if (oldIndex < prev && newIndex >= prev) return prev - 1;
      if (oldIndex > prev && newIndex <= prev) return prev + 1;
      return prev;
    });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Projects</h2>
        <button type="button" onClick={addProject} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium min-h-[44px]">+ Add Project</button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {projects.map((proj, index) => (
            <ProjectSortableItem
              key={proj.id || index}
              proj={proj}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpanded(index)}
              onUpdate={updateProject}
              onRemove={removeProject}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

type ProjectItem = ResumeData['projects'] extends (infer P)[] ? P : never;

function ProjectSortableItem({
  proj,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  proj: ProjectItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
}) {
  const id = proj.id || `proj-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const title = proj.name?.trim() || `Project ${index + 1}`;

  return (
    <div ref={setNodeRef} style={style} className={`border border-gray-200 rounded bg-gray-50/50 overflow-hidden ${isDragging ? 'opacity-60 z-10' : ''}`}>
      <div className="flex items-stretch gap-0 min-h-[44px]">
        <span
          className="flex items-center justify-center w-9 shrink-0 text-gray-400 cursor-grab active:cursor-grabbing border-r border-gray-200 hover:bg-gray-100 touch-none"
          {...listeners}
          {...attributes}
          aria-label="Drag to reorder"
        >
          <GripVertical size={18} />
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center justify-between gap-2 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-100 transition-colors min-h-[44px]"
          aria-expanded={isExpanded}
        >
          <span className="truncate">{title}</span>
          <span className="shrink-0 text-gray-500" aria-hidden>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </button>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-2">
          <input
            placeholder="Project Name"
            value={proj.name || ''}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-base"
          />
          <textarea
            placeholder="Description"
            value={proj.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            className="w-full border border-gray-300 p-2 rounded min-h-[80px] text-base"
          />
          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => onRemove(index)} className="text-sm text-gray-500 hover:text-red-600 min-h-[44px] px-2">Remove project</button>
          </div>
        </div>
      )}
    </div>
  );
}
