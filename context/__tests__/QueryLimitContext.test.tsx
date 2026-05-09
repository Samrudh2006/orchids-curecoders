import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect } from 'vitest';
import { QueryLimitProvider, useQueryLimit } from '../QueryLimitContext';

function QueryConsumer() {
  const {
    queriesUsed,
    canQuery,
    planType,
    incrementQuery,
    resetQueries,
    getRemainingQueries,
    setPlan
  } = useQueryLimit();

  return (
    <div>
      <span data-testid="used">{queriesUsed}</span>
      <span data-testid="remaining">{getRemainingQueries()}</span>
      <span data-testid="can-query">{canQuery ? 'yes' : 'no'}</span>
      <span data-testid="plan">{planType}</span>
      <button onClick={() => incrementQuery()}>Increment</button>
      <button onClick={resetQueries}>Reset</button>
      <button onClick={() => setPlan('pro')}>Set Pro</button>
    </div>
  );
}

describe('QueryLimitProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores stored usage and enforces limits', async () => {
    const today = new Date().toDateString();
    localStorage.setItem('curecoders_query_data', JSON.stringify({
      queries: 4,
      plan: 'free',
      resetDate: today
    }));

    render(
      <QueryLimitProvider>
        <QueryConsumer />
      </QueryLimitProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('used')).toHaveTextContent('4');
    });

    expect(screen.getByTestId('remaining')).toHaveTextContent('1');
    expect(screen.getByTestId('can-query')).toHaveTextContent('yes');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /increment/i }));

    expect(screen.getByTestId('used')).toHaveTextContent('5');
    expect(screen.getByTestId('remaining')).toHaveTextContent('0');
    expect(screen.getByTestId('can-query')).toHaveTextContent('no');
  });

  it('resets usage when the stored reset date is stale', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    localStorage.setItem('curecoders_query_data', JSON.stringify({
      queries: 3,
      plan: 'pro',
      resetDate: yesterday.toDateString()
    }));

    render(
      <QueryLimitProvider>
        <QueryConsumer />
      </QueryLimitProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('used')).toHaveTextContent('0');
    });

    const stored = JSON.parse(localStorage.getItem('curecoders_query_data') || '{}');
    expect(stored.resetDate).toBe(new Date().toDateString());
  });
});
