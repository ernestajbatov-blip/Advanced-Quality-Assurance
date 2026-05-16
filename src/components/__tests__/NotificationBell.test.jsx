import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import * as wellService from '../../axios/wellService';
import { vi } from 'vitest';

vi.mock('../../axios/wellService', () => ({
  fetchNotificationCount: vi.fn()
}));

vi.mock('../../components/Notifications/Notifications', () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="notifications-modal"><button onClick={onClose}>Close</button></div> : null
  )
}));

global.fetch = vi.fn();

describe('NotificationBell Component', () => {
  let intervalCallback = null;
  let originalSetInterval = global.setInterval;

  beforeEach(() => {
    vi.clearAllMocks();
    wellService.fetchNotificationCount.mockResolvedValue({ data: { count: 0 } });
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    global.setInterval = vi.fn((cb) => {
      intervalCallback = cb;
      return 123;
    });
  });

  afterEach(() => {
    global.setInterval = originalSetInterval;
    intervalCallback = null;
    document.body.innerHTML = '';
  });

  it('renders correctly and loads notification count', async () => {
    wellService.fetchNotificationCount.mockResolvedValueOnce({ data: { count: 5 } });
    render(<NotificationBell />);
    
    expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('shows 99+ when notification count is > 99', async () => {
    wellService.fetchNotificationCount.mockResolvedValueOnce({ data: { count: 105 } });
    render(<NotificationBell />);
    
    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  it('handles error fetching count', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    wellService.fetchNotificationCount.mockRejectedValueOnce(new Error('Network error'));
    render(<NotificationBell />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[Notification] Failed to fetch count:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('opens and closes notifications modal', async () => {
    render(<NotificationBell />);
    
    const bellButton = screen.getByTitle('Notifications');
    
    await waitFor(() => {
      expect(bellButton).not.toBeDisabled();
    });
    
    fireEvent.click(bellButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('notifications-modal')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Close'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('notifications-modal')).not.toBeInTheDocument();
    });
  });

  it('polls for recent well stops and shows popup', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1', well: 'BSK_001', delta: 50 }]
    });

    render(<NotificationBell />);
    
    // Manually trigger interval callback
    if (intervalCallback) intervalCallback();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/notifications/recent-well-stops?oil_field=BSK');
    });

    await waitFor(() => {
      expect(document.querySelector('.well-stop-popup')).toBeInTheDocument();
    });
    
    expect(document.querySelector('.well-stop-popup').textContent).toContain('BSK_001');
    
    const closeBtn = document.querySelector('.well-stop-popup-close');
    fireEvent.click(closeBtn);
  });

  it('handles fetch error in checkRecentWellStops', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    
    render(<NotificationBell />);
    
    if (intervalCallback) intervalCallback();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[Notification] Failed to fetch, status:', 500);
    });
    consoleSpy.mockRestore();
  });

  it('handles thrown error in checkRecentWellStops', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));
    
    render(<NotificationBell />);
    
    if (intervalCallback) intervalCallback();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[Notification] Error checking well stops:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});
