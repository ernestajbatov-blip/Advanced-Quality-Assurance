import React, { useContext, useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { WellsABCContext, WellsABCContextProvider } from '../WellsABCContext';
import * as wellService from '../../axios/wellService';
import { vi } from 'vitest';

vi.mock('../../axios/wellService', () => ({
  fetchWellsABC: vi.fn()
}));

const TestComponent = () => {
  const { wells, wellsGrid, wellsChart, selectedWell, resetWellsChart } = useContext(WellsABCContext);
  
  useEffect(() => {
    if (wells.length > 0 && wellsChart.length === 0) {
      resetWellsChart();
    }
  }, [wells, wellsChart, resetWellsChart]);

  return (
    <div>
      <span data-testid="wells">{wells.length}</span>
      <span data-testid="wellsGrid">{wellsGrid.length}</span>
      <span data-testid="wellsChart">{wellsChart.length}</span>
      <span data-testid="selectedWell">{selectedWell.length}</span>
    </div>
  );
};

describe('WellsABCContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data and initializes state correctly on mount', async () => {
    const mockData = [
      { well: 'BSK_0001', date: '2023-10-01' },
      { well: 'BSK_0002', date: '2023-10-01' },
      { well: 'BSK_0002', date: '2023-10-02' },
      { well: 'BSK_0002', date: '2023-10-03' }
    ];
    wellService.fetchWellsABC.mockResolvedValueOnce({ data: mockData });
    
    render(
      <WellsABCContextProvider>
        <TestComponent />
      </WellsABCContextProvider>
    );

    await waitFor(() => {
      // wells is 4
      expect(screen.getByTestId('wells')).toHaveTextContent('4');
    });
    
    // wellsChart should be same as wells
    expect(screen.getByTestId('wellsChart')).toHaveTextContent('4');

    // selectedWell should be 3 (all BSK_0002)
    expect(screen.getByTestId('selectedWell')).toHaveTextContent('3');

    // wellsGrid should be filtered by date from BSK_0002 at(-2) which is '2023-10-02'
    // only one well has date '2023-10-02'
    expect(screen.getByTestId('wellsGrid')).toHaveTextContent('1');
  });

  it('handles empty data response', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    wellService.fetchWellsABC.mockResolvedValueOnce({ data: null });
    
    render(
      <WellsABCContextProvider>
        <TestComponent />
      </WellsABCContextProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('No data found in response');
    });
    consoleSpy.mockRestore();
  });

  it('handles response without BSK_0002', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockData = [
      { well: 'BSK_0001', date: '2023-10-01' },
      { well: 'BSK_0001', date: '2023-10-02' }
    ];
    // This will actually error out in context because BSK_0002 is hardcoded and it tries to access .at(-2) of undefined
    // However, we should test the catch block or warn if possible. Wait, if we pass empty array, .at(-2) is undefined, ["date"] crashes.
    // Let's test the error catch block.
    wellService.fetchWellsABC.mockResolvedValueOnce({ data: mockData });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <WellsABCContextProvider>
        <TestComponent />
      </WellsABCContextProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('handles fetch error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    wellService.fetchWellsABC.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <WellsABCContextProvider>
        <TestComponent />
      </WellsABCContextProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching wells:', 'Network error');
    });
    consoleSpy.mockRestore();
  });
});
