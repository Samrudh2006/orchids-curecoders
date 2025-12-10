import { useEffect, useCallback } from 'react';

type ShortcutHandler = () => void;

interface Shortcuts {
  [key: string]: ShortcutHandler;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement instanceof HTMLInputElement || 
                           activeElement instanceof HTMLTextAreaElement ||
                           activeElement?.getAttribute('contenteditable') === 'true';

    if (event.key === 'Escape' && shortcuts['escape']) {
      shortcuts['escape']();
      return;
    }

    if (isInputFocused && event.key !== 'Escape') return;

    const key = [
      event.ctrlKey || event.metaKey ? 'ctrl' : '',
      event.shiftKey ? 'shift' : '',
      event.altKey ? 'alt' : '',
      event.key.toLowerCase()
    ].filter(Boolean).join('+');

    if (shortcuts[key]) {
      event.preventDefault();
      shortcuts[key]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUTS = {
  SEARCH: 'ctrl+k',
  NEW_QUERY: 'ctrl+n',
  ESCAPE: 'escape',
  TOGGLE_THEME: 'ctrl+shift+t',
  EXPORT_PDF: 'ctrl+p',
  BOOKMARKS: 'ctrl+b',
  COMPARE: 'ctrl+shift+c',
};
