import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import SearchModal from '../SearchModal';

describe('SearchModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders recent searches when available', () => {
    localStorage.setItem('curecoders_recent_searches', JSON.stringify([
      'market size',
      'trial pipeline'
    ]));

    render(
      <SearchModal
        isOpen
        onClose={vi.fn()}
        onSearch={vi.fn()}
      />
    );

    expect(screen.getByText(/recent searches/i)).toBeInTheDocument();
    expect(screen.getByText('market size')).toBeInTheDocument();
    expect(screen.getByText('trial pipeline')).toBeInTheDocument();
  });

  it('submits a query, updates storage, and clears the input', async () => {
    const onClose = vi.fn();
    const onSearch = vi.fn();

    render(
      <SearchModal
        isOpen
        onClose={onClose}
        onSearch={onSearch}
      />
    );

    const input = screen.getByPlaceholderText(/search queries/i);
    const user = userEvent.setup();
    await user.type(input, 'diabetes market{enter}');

    expect(onSearch).toHaveBeenCalledWith('diabetes market');
    expect(onClose).toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('');

    const stored = JSON.parse(localStorage.getItem('curecoders_recent_searches') || '[]');
    expect(stored[0]).toBe('diabetes market');
  });
});
