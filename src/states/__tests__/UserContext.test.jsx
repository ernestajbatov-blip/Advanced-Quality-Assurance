import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserContext, useUser } from '../UserContext';

const TestComponent = () => {
  const context = useUser();
  return <div>{context ? context.name : 'No User'}</div>;
};

describe('UserContext', () => {
  it('provides the user context value', () => {
    const mockUser = { name: 'Test User' };
    render(
      <UserContext.Provider value={mockUser}>
        <TestComponent />
      </UserContext.Provider>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('handles null context gracefully if used without provider or with null provider', () => {
    render(
      <UserContext.Provider value={null}>
        <TestComponent />
      </UserContext.Provider>
    );
    expect(screen.getByText('No User')).toBeInTheDocument();
  });
});
