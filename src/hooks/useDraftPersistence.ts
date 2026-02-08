import { useState, useEffect, useCallback, useRef } from 'react';
import { ResumeData } from '../core/types';
import { getSessionId } from '../api-service';

const DRAFT_DEBOUNCE_MS = 1500;

function isResumeDataLike(obj: unknown): obj is ResumeData {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.basics === 'object' &&
    Array.isArray(o.experience) &&
    Array.isArray(o.education) &&
    Array.isArray(o.projects) &&
    Array.isArray(o.skills) &&
    Array.isArray(o.achievements)
  );
}

function getDraftKey(): string {
  return `hexacv_draft_${getSessionId()}`;
}

export function useDraftPersistence(
  resume: ResumeData,
  setResume: (data: ResumeData) => void
): {
  showRestorePrompt: boolean;
  onRestore: () => void;
  onDismiss: () => void;
} {
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const pendingDraftRef = useRef<ResumeData | null>(null);
  const hasCheckedDraft = useRef(false);

  // On mount: check for existing draft and show restore prompt if present
  useEffect(() => {
    if (hasCheckedDraft.current) return;
    hasCheckedDraft.current = true;
    try {
      const raw = localStorage.getItem(getDraftKey());
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (isResumeDataLike(parsed)) {
        pendingDraftRef.current = parsed as ResumeData;
        setShowRestorePrompt(true);
      }
    } catch {
      // ignore invalid draft
    }
  }, []);

  // Debounced save when resume changes
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(getDraftKey(), JSON.stringify(resume));
      } catch {
        // ignore quota errors
      }
    }, DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [resume]);

  // Save on page unload
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(getDraftKey(), JSON.stringify(resume));
      } catch {
        // ignore
      }
    };
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, [resume]);

  const onRestore = useCallback(() => {
    const draft = pendingDraftRef.current;
    if (draft) {
      setResume(draft);
      pendingDraftRef.current = null;
    }
    setShowRestorePrompt(false);
  }, [setResume]);

  const onDismiss = useCallback(() => {
    try {
      localStorage.removeItem(getDraftKey());
    } catch {
      // ignore
    }
    pendingDraftRef.current = null;
    setShowRestorePrompt(false);
  }, []);

  return { showRestorePrompt, onRestore, onDismiss };
}
