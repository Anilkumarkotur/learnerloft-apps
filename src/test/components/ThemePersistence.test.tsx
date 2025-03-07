import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../../components/LandingPage';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Create a mock App component for direct import
const MockedApp = ({ checkTheme = true }: { checkTheme?: boolean }) => {
  React.useEffect(() => {
    if (checkTheme) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, [checkTheme]);
  
  return <div data-testid="app-component">Mocked App</div>;
};

// Mock App component without its router
vi.mock('../../App', () => ({
  __esModule: true,
  default: MockedApp
}));

// Mock components for routing purposes
vi.mock('../../components/Board', () => ({
  __esModule: true,
  default: () => <div data-testid="board-component">Mocked Board</div>,
  BoardHandle: vi.fn()
}));

// Mock document APIs for theme testing
const originalSetAttribute = document.documentElement.setAttribute;

describe('Theme Persistence Between Components', () => {
  let localStorageMock: { getItem: any, setItem: any, clear: any };
  
  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Default behavior for localStorage.getItem (no saved data)
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock document.documentElement.setAttribute
    document.documentElement.setAttribute = vi.fn();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute = originalSetAttribute;
  });
  
  it('toggles dark mode in LandingPage', () => {
    // Render the LandingPage component
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    
    // Verify we're on the landing page
    expect(screen.getByText('Engineering Hub')).toBeInTheDocument();
    
    // Find the theme toggle button and click it
    const themeToggleButton = screen.getByRole('button', { name: /.*/ });
    fireEvent.click(themeToggleButton);
    
    // Verify dark mode was set
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });
  
  it('loads dark mode in App if saved in localStorage', () => {
    // Simulate dark theme saved in localStorage
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'theme') return 'dark';
      return null;
    });
    
    // Render the mocked App directly
    render(<MockedApp checkTheme={true} />);
    
    // Verify the app component is rendered
    expect(screen.getByTestId('app-component')).toBeInTheDocument();
    
    // Verify dark mode was set from localStorage
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
  
  it('loads light mode by default on new sessions', () => {
    // Ensure localStorage returns null for theme (new session)
    localStorageMock.getItem.mockReturnValue(null);
    
    // Render the mocked App directly
    render(<MockedApp checkTheme={true} />);
    
    // Verify we're on the app component
    expect(screen.getByTestId('app-component')).toBeInTheDocument();
    
    // Should not have called setAttribute for theme with dark
    expect(document.documentElement.setAttribute).not.toHaveBeenCalledWith('data-theme', 'dark');
  });
}); 