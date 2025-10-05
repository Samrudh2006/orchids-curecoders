import React from 'react';
import { useKeyboardShortcuts } from '../context/KeyboardShortcutsContext';
import { X, Command, Keyboard } from './Icons';

const KeyboardShortcutsModal: React.FC = () => {
  const { shortcuts, isShortcutsModalOpen, toggleShortcutsModal } = useKeyboardShortcuts();

  if (!isShortcutsModalOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const formatShortcut = (shortcut: any) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    
    let mainKey = shortcut.key;
    if (mainKey === ' ') mainKey = 'Space';
    if (mainKey === 'Escape') mainKey = 'Esc';
    if (mainKey === '?') mainKey = '?';
    
    keys.push(mainKey);
    return keys;
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Navigation': '🧭',
    'Search': '🔍',
    'Actions': '⚡',
    'Preferences': '⚙️',
    'AI Assistant': '🤖',
    'Help': '❓',
    'UI': '🎨'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Boost your productivity with these shortcuts</p>
            </div>
          </div>
          <button
            onClick={toggleShortcutsModal}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-lg">{categoryIcons[category] || '📋'}</span>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{category}</h3>
                </div>
                
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors">
                      <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center space-x-1">
                        {formatShortcut(shortcut).map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-xs text-slate-400 mx-1">+</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded shadow-sm min-w-[24px] text-center">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                💡
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Power User Tips</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Press <kbd className="px-1 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">?</kbd> anytime to see this shortcuts panel</li>
                  <li>• Use <kbd className="px-1 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">Esc</kbd> to close any modal or panel</li>
                  <li>• Shortcuts work from anywhere except when typing in text fields</li>
                  <li>• Combine with voice assistant for the ultimate pharmaceutical research experience</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <Command className="w-4 h-4" />
            <span>Platform shortcuts enabled</span>
          </div>
          <button
            onClick={toggleShortcutsModal}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;