import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JsonFormatter from '../../components/JsonFormatter';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve())
  }
});

describe('JsonFormatter Component', () => {
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
    
    // Reset clipboard mock
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    // Restore original document.documentElement.setAttribute
    document.documentElement.setAttribute = originalDocumentElementAttr;
  });

  const renderJsonFormatter = () => {
    return render(
      <BrowserRouter>
        <JsonFormatter />
      </BrowserRouter>
    );
  };

  // Basic rendering tests
  it('renders the component correctly', () => {
    renderJsonFormatter();
    
    // Check that main sections are present
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
    expect(screen.getByText('Input JSON')).toBeInTheDocument();
    expect(screen.getByText('Formatted JSON')).toBeInTheDocument();
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Minify')).toBeInTheDocument();
    expect(screen.getByText('Validate')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
  });

  // Theme tests
  it('shows moon icon by default in light mode', () => {
    renderJsonFormatter();
    
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
    
    renderJsonFormatter();
    
    // The toggle should have the sun emoji for dark mode
    const themeToggle = screen.getByText('☀️');
    expect(themeToggle).toBeInTheDocument();
    
    // Document theme should be set to dark
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('toggles theme when the theme button is clicked', () => {
    renderJsonFormatter();
    
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

  // JSON formatting tests
  it('formats JSON correctly when Format button is clicked', () => {
    renderJsonFormatter();
    
    // Input some JSON
    const input = screen.getByLabelText('Input JSON');
    fireEvent.change(input, { target: { value: '{"name":"John","age":30}' } });
    
    // Click format button
    fireEvent.click(screen.getByText('Format'));
    
    // Check output
    const output = screen.getByLabelText('Formatted JSON') as HTMLTextAreaElement;
    expect(output.value).toContain('"name": "John"');
    expect(output.value).toContain('"age": 30');
  });

  it('minifies JSON correctly when Minify button is clicked', () => {
    renderJsonFormatter();
    
    const prettyJson = `{
      "name": "John",
      "age": 30
    }`;
    
    // Input some JSON
    const input = screen.getByLabelText('Input JSON');
    fireEvent.change(input, { target: { value: prettyJson } });
    
    // Click minify button
    fireEvent.click(screen.getByText('Minify'));
    
    // Check output
    const output = screen.getByLabelText('Formatted JSON') as HTMLTextAreaElement;
    expect(output.value).toBe('{"name":"John","age":30}');
  });

  it('validates JSON correctly when Validate button is clicked', () => {
    renderJsonFormatter();
    
    // Input valid JSON
    const input = screen.getByLabelText('Input JSON');
    fireEvent.change(input, { target: { value: '{"name":"John","age":30}' } });
    
    // Click validate button
    fireEvent.click(screen.getByText('Validate'));
    
    // Check output
    const output = screen.getByLabelText('Formatted JSON') as HTMLTextAreaElement;
    expect(output.value).toBe('JSON is valid!');
  });

  it('shows error for invalid JSON', () => {
    renderJsonFormatter();
    
    // Input invalid JSON
    const input = screen.getByLabelText('Input JSON');
    fireEvent.change(input, { target: { value: '{"name":"John","age:30}' } });
    
    // Click format button
    fireEvent.click(screen.getByText('Format'));
    
    // Check error message is displayed
    expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
  });

  // Clear functionality
  it('clears input and output when Clear button is clicked', () => {
    renderJsonFormatter();
    
    // Input some JSON
    const input = screen.getByLabelText('Input JSON') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '{"name":"John","age":30}' } });
    
    // Format it
    fireEvent.click(screen.getByText('Format'));
    
    // Check output has content
    const output = screen.getByLabelText('Formatted JSON') as HTMLTextAreaElement;
    expect(output.value).not.toBe('');
    
    // Click clear button
    fireEvent.click(screen.getByText('Clear'));
    
    // Check both input and output are cleared
    expect(input.value).toBe('');
    expect(output.value).toBe('');
  });

  // Copy to clipboard
  it('copies output to clipboard when Copy button is clicked', async () => {
    renderJsonFormatter();
    
    // Input some JSON
    const input = screen.getByLabelText('Input JSON');
    fireEvent.change(input, { target: { value: '{"name":"John","age":30}' } });
    
    // Format it
    fireEvent.click(screen.getByText('Format'));
    
    // Get output content
    const output = screen.getByLabelText('Formatted JSON') as HTMLTextAreaElement;
    const outputContent = output.value;
    
    // Click copy button
    fireEvent.click(screen.getByText('Copy to Clipboard'));
    
    // Check clipboard API was called with correct content
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(outputContent);
    
    // Check the button text changes to indicate success
    await waitFor(() => {
      expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument();
    });
    
    // After a delay, text should return to normal
    await waitFor(() => {
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  // Navigation
  it('has a working home button', () => {
    renderJsonFormatter();
    
    const homeButton = screen.getByText('Home');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton.closest('a')).toHaveAttribute('href', '/');
  });
}); 