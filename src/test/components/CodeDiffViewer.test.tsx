import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CodeDiffViewer from '../../components/CodeDiffViewer';

// Mock for document.documentElement.setAttribute
const mockSetAttribute = vi.fn();
const originalSetAttribute = document.documentElement.setAttribute;

describe('CodeDiffViewer Component', () => {
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
    
    // Default behavior for localStorage.getItem (light mode by default)
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'theme') return 'light';
      return null;
    });
    
    // Mock document.documentElement.setAttribute
    document.documentElement.setAttribute = mockSetAttribute;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.setAttribute = originalSetAttribute;
  });
  
  const renderCodeDiffViewer = () => {
    return render(
      <BrowserRouter>
        <CodeDiffViewer />
      </BrowserRouter>
    );
  };
  
  it('renders the CodeDiffViewer component', () => {
    renderCodeDiffViewer();
    
    // Check that main elements are present
    expect(screen.getByText('Code Diff Viewer')).toBeInTheDocument();
    expect(screen.getByLabelText('Original Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Modified Code')).toBeInTheDocument();
    expect(screen.getByText('Differences')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });
  
  it('has a working home button', () => {
    renderCodeDiffViewer();
    
    const homeButton = screen.getByText('Home');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton.closest('a')).toHaveAttribute('href', '/');
  });
  
  it('toggles theme when the theme button is clicked', () => {
    renderCodeDiffViewer();
    
    // Initially in light mode with moon icon
    const themeToggle = screen.getByText('🌙');
    
    // Click to toggle to dark mode
    fireEvent.click(themeToggle);
    
    // Should set document theme to dark
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    
    // Should store preference in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Emoji should change to sun
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    // Click again to toggle back to light mode
    fireEvent.click(screen.getByText('☀️'));
    
    // Should set document theme to light
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
    
    // Should store preference in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });
  
  it('loads dark theme from localStorage if previously saved', () => {
    // Mock localStorage to return 'dark' for theme
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'theme') return 'dark';
      return null;
    });
    
    renderCodeDiffViewer();
    
    // The toggle should have the sun emoji for dark mode
    const themeToggle = screen.getByText('☀️');
    expect(themeToggle).toBeInTheDocument();
    
    // Document theme should be set to dark
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });
  
  it('computes diff between original and modified code', () => {
    renderCodeDiffViewer();
    
    // Get text areas
    const originalTextArea = screen.getByLabelText('Original Code') as HTMLTextAreaElement;
    const modifiedTextArea = screen.getByLabelText('Modified Code') as HTMLTextAreaElement;
    
    // Enter text in both text areas
    fireEvent.change(originalTextArea, { target: { value: 'line 1\nline 2\nline 3' } });
    fireEvent.change(modifiedTextArea, { target: { value: 'line 1\nmodified line\nline 3' } });
    
    // Click Compare button
    fireEvent.click(screen.getByText('Compare'));
    
    // Check if diff is displayed correctly
    const diffSection = screen.getByTestId('diff-section');
    expect(diffSection).toBeInTheDocument();
    
    // Get all the diff lines
    const diffLines = diffSection.querySelectorAll('.sc-jHswkR');
    expect(diffLines.length).toBe(4); // We should have 4 lines (unchanged, removed, added, unchanged)
    
    // Check the line contents
    expect(diffLines[0].textContent).toMatch(/line 1$/);
    expect(diffLines[1].textContent).toMatch(/- line 2$/);
    expect(diffLines[2].textContent).toMatch(/\+ modified line$/);
    expect(diffLines[3].textContent).toMatch(/line 3$/);
  });
  
  it('clears all input and output when Clear All button is clicked', () => {
    renderCodeDiffViewer();
    
    // Get text areas
    const originalTextArea = screen.getByLabelText('Original Code') as HTMLTextAreaElement;
    const modifiedTextArea = screen.getByLabelText('Modified Code') as HTMLTextAreaElement;
    
    // Enter text in both text areas
    fireEvent.change(originalTextArea, { target: { value: 'test content' } });
    fireEvent.change(modifiedTextArea, { target: { value: 'modified content' } });
    
    // Click Compare button
    fireEvent.click(screen.getByText('Compare'));
    
    // Verify diff is shown
    expect(screen.queryByText('No differences to display')).not.toBeInTheDocument();
    
    // Click Clear All button
    fireEvent.click(screen.getByText('Clear All'));
    
    // Verify text areas are empty
    expect(originalTextArea.value).toBe('');
    expect(modifiedTextArea.value).toBe('');
    
    // Verify diff section shows the default message
    expect(screen.getByText('No differences to display. Click \'Compare\' to see the diff.')).toBeInTheDocument();
  });
  
  it('handles empty input gracefully', () => {
    renderCodeDiffViewer();
    
    // Click Compare button without entering any text
    fireEvent.click(screen.getByText('Compare'));
    
    // Verify diff section shows the default message
    expect(screen.getByText('No differences to display. Click \'Compare\' to see the diff.')).toBeInTheDocument();
  });
}); 