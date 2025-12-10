import React from 'react';
import { X, Keyboard, Command } from './Icons';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open search' },
  { keys: ['Ctrl', 'B'], description: 'Open bookmarks' },
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Open comparison tool' },
  { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle theme' },
  { keys: ['Escape'], description: 'Close modal' },
  { keys: ['Shift', '?'], description: 'Show shortcuts' },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Keyboard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-slate-600 dark:text-slate-300">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <React.Fragment key={j}>
                      <kbd className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                        {key}
                      </kbd>
                      {j < shortcut.keys.length - 1 && (
                        <span className="text-slate-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Escape</kbd> to close this modal
          </p>
        </div>
      </div>
    </div>
  );
}
