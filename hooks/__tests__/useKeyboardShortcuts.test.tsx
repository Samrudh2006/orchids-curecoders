import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

function ShortcutHarness({
  onSearch,
  onEscape
}: {
  onSearch: () => void;
  onEscape: () => void;
}) {
  useKeyboardShortcuts({
    'ctrl+k': onSearch,
    escape: onEscape
  });

  return <input aria-label="Search input" />;
}

describe('useKeyboardShortcuts', () => {
  it('fires shortcuts and prevents default behavior', () => {
    const onSearch = vi.fn();
    const onEscape = vi.fn();

    render(<ShortcutHarness onSearch={onSearch} onEscape={onEscape} />);

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      cancelable: true
    });

    window.dispatchEvent(event);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('ignores shortcuts when input is focused except escape', () => {
    const onSearch = vi.fn();
    const onEscape = vi.fn();

    render(<ShortcutHarness onSearch={onSearch} onEscape={onEscape} />);

    const input = screen.getByRole('textbox', { name: /search input/i });
    input.focus();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
