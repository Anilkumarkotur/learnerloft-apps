import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../../components/LandingPage';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('LandingPage Component', () => {
  let localStorageMock: { getItem: any, setItem: any, clear: any };
  let originalDocumentElementAttr: any;
  
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
    
    // Save original document.documentElement.setAttribute
    originalDocumentElementAttr = document.documentElement.setAttribute;
    // Mock document.documentElement.setAttribute
    document.documentElement.setAttribute = vi.fn();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    // Restore original document.documentElement.setAttribute
    document.documentElement.setAttribute = originalDocumentElementAttr;
  });
  
  // Helper function to render with Router
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
  };
  
  it('renders the landing page with engineering tools sections', () => {
    renderWithRouter();
    
    // Check that main sections are present
    expect(screen.getByText('Engineering Hub')).toBeInTheDocument();
    expect(screen.getByText('Engineering Tools')).toBeInTheDocument();
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('Project Planning')).toBeInTheDocument();
  });
  
  it('shows dark mode icon (moon) by default in light mode', () => {
    renderWithRouter();
    
    // The toggle should have the moon emoji for light mode
    const themeToggle = screen.getByText('🌙');
    expect(themeToggle).toBeInTheDocument();
  });
  
  it('loads dark theme from localStorage if previously saved', () => {
    // Mock localStorage to return 'dark' for theme
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'theme') return 'dark';
      return null;
    });
    
    renderWithRouter();
    
    // The toggle should have the sun emoji for dark mode
    const themeToggle = screen.getByText('☀️');
    expect(themeToggle).toBeInTheDocument();
    
    // Document theme should be set to dark
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
  
  it('toggles theme when the theme button is clicked', () => {
    renderWithRouter();
    
    // Initially in light mode with moon icon
    const themeToggle = screen.getByText('🌙');
    
    // Click to toggle to dark mode
    fireEvent.click(themeToggle);
    
    // Should set document theme to dark
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    
    // Should store preference in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Emoji should change to sun
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    // Click again to toggle back to light mode
    fireEvent.click(screen.getByText('☀️'));
    
    // Should set document theme to light
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    
    // Should store preference in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });
  
  it('opens create board modal when clicking on Retrospective Board card', () => {
    renderWithRouter();
    
    // Find the Retrospective Board card and click it
    const retroCard = screen.getByText('Retrospective Board');
    fireEvent.click(retroCard);
    
    // Modal should open with appropriate title
    expect(screen.getByText('Create Retrospective Board')).toBeInTheDocument();
    
    // Input field for board name should be visible
    expect(screen.getByPlaceholderText('Enter board name')).toBeInTheDocument();
  });
}); 