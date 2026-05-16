import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { WellsContext, WellsContextProvider } from '../WellsContext';
import * as wellService from '../../axios/wellService';
import { vi } from 'vitest';

vi.mock('../../axios/wellService', () => ({
  fetchWells: vi.fn()
}));

const TestComponent = () => {
  const { wells, fond } = useContext(WellsContext);
  return (
    <div>
      <span data-testid="fond">{fond}</span>
      <span data-testid="wells">{wells.length}</span>
      {wells.map(w => <span key={w.id} data-testid="well-name">{w.name}</span>)}
    </div>
  );
};

describe('WellsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches wells on mount and sets them in context', async () => {
    wellService.fetchWells.mockResolvedValueOnce({ data: [{ id: 1, name: 'Well 1' }, { id: 2, name: 'Well 2' }] });
    
    render(
      <WellsContextProvider>
        <TestComponent />
      </WellsContextProvider>
    );

    expect(screen.getByTestId('fond')).toHaveTextContent('0');
    expect(screen.getByTestId('wells')).toHaveTextContent('0');

    await waitFor(() => {
      expect(screen.getByTestId('wells')).toHaveTextContent('2');
    });
    
    expect(screen.getAllByTestId('well-name')[0]).toHaveTextContent('Well 1');
  });

  it('handles fetch errors gracefully (logs to console)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    wellService.fetchWells.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <WellsContextProvider>
        <TestComponent />
      </WellsContextProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('There was an error while fetching the wells!', expect.any(Error));
    });
    
    expect(screen.getByTestId('wells')).toHaveTextContent('0');
    consoleSpy.mockRestore();
  });
});
