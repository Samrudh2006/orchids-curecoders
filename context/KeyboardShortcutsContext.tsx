import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
  category: string;
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  isShortcutsModalOpen: boolean;
  toggleShortcutsModal: () => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleShortcutsModal = useCallback(() => {
    setIsShortcutsModalOpen(prev => !prev);
  }, []);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      const filtered = prev.filter(s => s.key !== shortcut.key || s.ctrlKey !== shortcut.ctrlKey || s.altKey !== shortcut.altKey);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          (event.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Initialize default shortcuts
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      // Navigation
      {
        key: 'h',
        ctrlKey: true,
        description: 'Go to Home',
        action: () => navigate('/'),
        category: 'Navigation'
      },
      {
        key: 'r',
        ctrlKey: true,
        description: 'Go to History',
        action: () => navigate('/history'),
        category: 'Navigation'
      },
      
      // UI Controls
      {
        key: '?',
        description: 'Show keyboard shortcuts',
        action: toggleShortcutsModal,
        category: 'Help'
      },
      {
        key: 'Escape',
        description: 'Close modals/panels',
        action: () => {
          setIsShortcutsModalOpen(false);
          // Could also close other modals
        },
        category: 'UI'
      },
      
      // Search & Focus
      {
        key: '/',
        description: 'Focus search bar',
        action: () => {
          const searchInput = document.querySelector('input[placeholder*="search" i], input[placeholder*="query" i]') as HTMLInputElement;
          searchInput?.focus();
        },
        category: 'Search'
      },
      {
        key: 'f',
        ctrlKey: true,
        description: 'Find in page',
        action: () => {
          // Browser's default Ctrl+F will handle this
        },
        category: 'Search'
      },

      // Theme & Preferences
      {
        key: 't',
        ctrlKey: true,
        description: 'Toggle dark/light theme',
        action: () => {
          const themeButton = document.querySelector('[aria-label="Toggle theme"]') as HTMLButtonElement;
          themeButton?.click();
        },
        category: 'Preferences'
      },

      // Quick Actions
      {
        key: 'n',
        ctrlKey: true,
        description: 'New research query',
        action: () => {
          const queryInput = document.querySelector('textarea[placeholder*="pharmaceutical" i], input[placeholder*="pharmaceutical" i]') as HTMLInputElement;
          if (queryInput) {
            queryInput.focus();
            queryInput.select();
          }
        },
        category: 'Actions'
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Save/Export current results',
        action: () => {
          const exportButton = document.querySelector('button[title*="export" i], button[title*="download" i]') as HTMLButtonElement;
          exportButton?.click();
        },
        category: 'Actions'
      },

      // Voice & Chat
      {
        key: 'v',
        ctrlKey: true,
        description: 'Toggle voice assistant',
        action: () => {
          const voiceButton = document.querySelector('[aria-label*="voice" i]') as HTMLButtonElement;
          voiceButton?.click();
        },
        category: 'AI Assistant'
      },
      {
        key: 'c',
        ctrlKey: true,
        altKey: true,
        description: 'Toggle AI chat',
        action: () => {
          const chatButton = document.querySelector('[aria-label*="chat" i]') as HTMLButtonElement;
          chatButton?.click();
        },
        category: 'AI Assistant'
      }
    ];

    defaultShortcuts.forEach(registerShortcut);
  }, [navigate, registerShortcut, toggleShortcutsModal]);

  const value: KeyboardShortcutsContextType = {
    shortcuts,
    isShortcutsModalOpen,
    toggleShortcutsModal,
    registerShortcut,
    unregisterShortcut
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = (): KeyboardShortcutsContextType => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};