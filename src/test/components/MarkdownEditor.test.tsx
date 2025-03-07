import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import MarkdownEditor from '../../components/MarkdownEditor';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('MarkdownEditor Component', () => {
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
    
    // Mock getSelection and Range for toolbar button tests
    document.getSelection = vi.fn().mockReturnValue({
      removeAllRanges: vi.fn(),
      addRange: vi.fn(),
      getRangeAt: vi.fn().mockReturnValue({
        setStart: vi.fn(),
        setEnd: vi.fn(),
        commonAncestorContainer: {
          nodeName: "#text",
          nodeType: 3,
          nodeValue: "Test"
        }
      }),
      rangeCount: 1
    });
    
    // Create Range mock
    (window as any).Range = function Range() {
      return {
        setStart: vi.fn(),
        setEnd: vi.fn(),
        commonAncestorContainer: {
          nodeName: "#text",
          nodeType: 3,
          nodeValue: "Test"
        },
        cloneRange: vi.fn()
      };
    };
    
    // For textarea selection
    HTMLTextAreaElement.prototype.setSelectionRange = vi.fn();
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    // Restore original document.documentElement.setAttribute
    document.documentElement.setAttribute = originalDocumentElementAttr;
  });

  const renderMarkdownEditor = () => {
    return render(
      <BrowserRouter>
        <MarkdownEditor />
      </BrowserRouter>
    );
  };

  // Basic rendering tests
  it('renders the component correctly', () => {
    render(<MemoryRouter><MarkdownEditor /></MemoryRouter>);
    
    expect(screen.getAllByText('Markdown Editor')[0]).toBeInTheDocument();
    expect(screen.getByText('Edit Markdown')).toBeInTheDocument();
    expect(screen.getAllByText('Preview')[0]).toBeInTheDocument();
    
    // Check toolbar buttons
    expect(screen.getByText('H1')).toBeInTheDocument();
    expect(screen.getByText('H2')).toBeInTheDocument();
    expect(screen.getByText('H3')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.getByText('Italic')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Code Block')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Numbered List')).toBeInTheDocument();
    expect(screen.getByText('Quote')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
  });

  // Theme tests
  it('shows moon icon by default in light mode', () => {
    renderMarkdownEditor();
    
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
    
    renderMarkdownEditor();
    
    // The toggle should have the sun emoji for dark mode
    const themeToggle = screen.getByText('☀️');
    expect(themeToggle).toBeInTheDocument();
    
    // Document theme should be set to dark
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('toggles theme when the theme button is clicked', () => {
    renderMarkdownEditor();
    
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

  // Markdown parsing tests
  it('parses markdown correctly and updates preview', () => {
    render(<MemoryRouter><MarkdownEditor /></MemoryRouter>);
    
    const input = screen.getByLabelText('Markdown input');
    fireEvent.change(input, { target: { value: '# Test Heading\n\nThis is a paragraph.' } });
    
    const previewContainer = screen.getAllByText('Preview')[0].parentElement;
    const previewDiv = previewContainer?.nextElementSibling as HTMLDivElement;
    
    if (previewDiv) {
      expect(previewDiv.innerHTML).toContain('<h1>');
      expect(previewDiv.innerHTML).toContain('Test Heading');
      expect(previewDiv.innerHTML).toContain('This is a paragraph');
    }
  });

  it('parses various markdown elements correctly', () => {
    render(<MemoryRouter><MarkdownEditor /></MemoryRouter>);
    
    const input = screen.getByLabelText('Markdown input');
    fireEvent.change(input, { target: { value: `# Heading 1
## Heading 2
### Heading 3
**Bold text**
*Italic text*
- List item 1
- List item 2
1. Numbered item 1
2. Numbered item 2
> This is a blockquote
\`inline code\`
\`\`\`
Code block
\`\`\`
[Link](https://example.com)
    ` } });
    
    const previewContainer = screen.getAllByText('Preview')[0].parentElement;
    const previewDiv = previewContainer?.nextElementSibling as HTMLDivElement;
    
    if (previewDiv) {
      // Verify headings
      expect(previewDiv.innerHTML).toContain('Heading 1');
      expect(previewDiv.innerHTML).toContain('Heading 2');
      expect(previewDiv.innerHTML).toContain('Heading 3');
      
      // Verify text formatting
      expect(previewDiv.innerHTML).toContain('Bold text');
      expect(previewDiv.innerHTML).toContain('Italic text');
      
      // Verify lists
      expect(previewDiv.innerHTML).toContain('List item 1');
      expect(previewDiv.innerHTML).toContain('List item 2');
      expect(previewDiv.innerHTML).toContain('Numbered item 1');
      expect(previewDiv.innerHTML).toContain('Numbered item 2');
      
      // Verify blockquote
      expect(previewDiv.innerHTML).toContain('This is a blockquote');
      
      // Verify code
      expect(previewDiv.innerHTML).toContain('inline code');
      expect(previewDiv.innerHTML).toContain('Code block');
      
      // Verify link
      expect(previewDiv.innerHTML).toContain('Link');
      expect(previewDiv.innerHTML).toContain('https://example.com');
    }
  });

  // Toolbar button tests
  it('inserts heading markdown when heading buttons are clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click H1 button
    fireEvent.click(screen.getByText('H1'));
    expect(textarea.value).toContain('# ');
    
    // Clear and test H2
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.click(screen.getByText('H2'));
    expect(textarea.value).toContain('## ');
    
    // Clear and test H3
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.click(screen.getByText('H3'));
    expect(textarea.value).toContain('### ');
  });

  it('inserts bold markdown when Bold button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Bold button
    fireEvent.click(screen.getByText('Bold'));
    expect(textarea.value).toContain('****');
  });

  it('inserts italic markdown when Italic button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Italic button
    fireEvent.click(screen.getByText('Italic'));
    expect(textarea.value).toContain('**');
  });

  it('inserts link markdown when Link button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Link button
    fireEvent.click(screen.getByText('Link'));
    expect(textarea.value).toContain('[](url)');
  });

  it('inserts code markdown when Code button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Code button
    fireEvent.click(screen.getByText('Code'));
    expect(textarea.value).toContain('``');
  });

  it('inserts code block markdown when Code Block button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Code Block button
    fireEvent.click(screen.getByText('Code Block'));
    expect(textarea.value).toContain('```\n\n```');
  });

  it('inserts list markdown when List button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click List button
    fireEvent.click(screen.getByText('List'));
    expect(textarea.value).toContain('- ');
  });

  it('inserts numbered list markdown when Numbered List button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Numbered List button
    fireEvent.click(screen.getByText('Numbered List'));
    expect(textarea.value).toContain('1. ');
  });

  it('inserts blockquote markdown when Quote button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Quote button
    fireEvent.click(screen.getByText('Quote'));
    expect(textarea.value).toContain('> ');
  });

  it('inserts table markdown when Table button is clicked', () => {
    renderMarkdownEditor();
    
    const textarea = screen.getByPlaceholderText('Enter markdown here...') as HTMLTextAreaElement;
    
    // Click Table button
    fireEvent.click(screen.getByText('Table'));
    expect(textarea.value).toContain('| Header 1 | Header 2 |');
    expect(textarea.value).toContain('| -------- | -------- |');
    expect(textarea.value).toContain('| Cell 1   | Cell 2   |');
  });

  // Navigation test
  it('has a working home button', () => {
    renderMarkdownEditor();
    
    const homeButton = screen.getByText('Home');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton.closest('a')).toHaveAttribute('href', '/');
  });
}); 