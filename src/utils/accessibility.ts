/**
 * ACCESSIBILITY UTILITIES
 * 
 * WCAG 2.1 AA compliant utilities for:
 * - Focus management
 * - Keyboard navigation
 * - Screen reader support
 * - Modal focus trapping
 */

// ============== FOCUS MANAGEMENT ==============

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ].join(', ');
  
  const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  // Store previously focused element
  const previouslyFocused = document.activeElement as HTMLElement;
  
  // Focus first element
  firstFocusable?.focus();
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    previouslyFocused?.focus();
  };
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(', ')));
}

/**
 * Focus first focusable element in container
 */
export function focusFirstElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  elements[0]?.focus();
}

/**
 * Focus element by ID after render
 */
export function focusById(id: string, delay: number = 0): void {
  setTimeout(() => {
    const element = document.getElementById(id);
    element?.focus();
  }, delay);
}

// ============== KEYBOARD NAVIGATION ==============

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

/**
 * Register keyboard shortcuts
 */
export function registerKeyboardShortcuts(
  shortcuts: KeyboardShortcut[]
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape to work everywhere
      if (e.key !== 'Escape') return;
    }
    
    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
      const shiftMatch = !!shortcut.shift === e.shiftKey;
      const altMatch = !!shortcut.alt === e.altKey;
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Common keyboard shortcuts for resume builder
 */
export const COMMON_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'Escape',
    action: () => {
      // Close any open modal
      const modal = document.querySelector('[role="dialog"]');
      const closeButton = modal?.querySelector('button[aria-label*="close"], button[aria-label*="Close"]');
      (closeButton as HTMLButtonElement)?.click();
    },
    description: 'Close modal'
  },
  {
    key: 's',
    ctrl: true,
    action: () => {
      // Trigger save (if available)
      const saveButton = document.querySelector('[data-action="save"]');
      (saveButton as HTMLButtonElement)?.click();
    },
    description: 'Save resume'
  },
  {
    key: 'p',
    ctrl: true,
    action: () => {
      // Trigger preview/print
      const previewButton = document.querySelector('[data-action="preview"]');
      (previewButton as HTMLButtonElement)?.click();
    },
    description: 'Preview/Print resume'
  }
];

// ============== SCREEN READER UTILITIES ==============

/**
 * Announce message to screen readers
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcer = document.getElementById('sr-announcer') || createAnnouncer();
  announcer.setAttribute('aria-live', priority);
  announcer.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

/**
 * Create screen reader announcer element
 */
function createAnnouncer(): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Generate unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============== SKIP LINKS ==============

/**
 * Create skip link element
 */
export function createSkipLink(
  targetId: string,
  text: string = 'Skip to main content'
): HTMLElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.className = 'skip-link';
  link.textContent = text;
  
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    target?.focus();
    target?.scrollIntoView();
  });
  
  return link;
}

/**
 * Initialize skip links
 */
export function initSkipLinks(): void {
  // Check if skip link already exists
  if (document.querySelector('.skip-link')) return;
  
  const mainContent = document.querySelector('main') || document.getElementById('main-content');
  if (!mainContent) return;
  
  // Ensure main content is focusable
  if (!mainContent.hasAttribute('tabindex')) {
    mainContent.setAttribute('tabindex', '-1');
  }
  
  const skipLink = createSkipLink(mainContent.id || 'main-content');
  document.body.insertBefore(skipLink, document.body.firstChild);
}

// ============== ARIA HELPERS ==============

/**
 * Set aria-expanded state
 */
export function setAriaExpanded(
  trigger: HTMLElement,
  expanded: boolean,
  contentId?: string
): void {
  trigger.setAttribute('aria-expanded', String(expanded));
  
  if (contentId) {
    trigger.setAttribute('aria-controls', contentId);
  }
}

/**
 * Set aria-selected state for list items
 */
export function setAriaSelected(
  items: HTMLElement[],
  selectedIndex: number
): void {
  items.forEach((item, index) => {
    item.setAttribute('aria-selected', String(index === selectedIndex));
  });
}

/**
 * Create accessible loading state
 */
export function setAriaLoading(
  container: HTMLElement,
  loading: boolean,
  message: string = 'Loading...'
): void {
  if (loading) {
    container.setAttribute('aria-busy', 'true');
    announce(message, 'polite');
  } else {
    container.removeAttribute('aria-busy');
  }
}

// ============== VALIDATION HELPERS ==============

/**
 * Associate error message with input
 */
export function setAriaError(
  input: HTMLElement,
  errorId: string,
  hasError: boolean
): void {
  if (hasError) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

/**
 * Create accessible error message element
 */
export function createErrorMessage(
  id: string,
  message: string
): HTMLElement {
  const error = document.createElement('span');
  error.id = id;
  error.className = 'error-message';
  error.setAttribute('role', 'alert');
  error.textContent = message;
  return error;
}

// ============== REACT HOOKS ==============

/**
 * Hook for managing focus trap (use in modal components)
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
): void {
  // Implementation for React:
  // useEffect(() => {
  //   if (!isActive || !containerRef.current) return;
  //   return trapFocus(containerRef.current);
  // }, [isActive, containerRef]);
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  // Implementation for React:
  // useEffect(() => {
  //   return registerKeyboardShortcuts(shortcuts);
  // }, [shortcuts]);
}

// ============== INITIALIZATION ==============

/**
 * Initialize all accessibility features
 */
export function initAccessibility(): void {
  initSkipLinks();
  registerKeyboardShortcuts(COMMON_SHORTCUTS);
}
