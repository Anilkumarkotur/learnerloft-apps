import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Layout components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-primary);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  box-shadow: var(--elevation-2);
`;

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const EditorSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    margin-right: 20px;
    margin-bottom: 0;
  }
`;

const PreviewSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--surface-color);
  overflow: auto;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 200px;
  padding: 16px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  resize: none;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }
`;

const Preview = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;
  }
  
  h1 {
    font-size: 2em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }
  
  h3 {
    font-size: 1.25em;
  }
  
  p {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  ul, ol {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 2em;
  }
  
  li {
    margin-top: 0.25em;
  }
  
  code {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  
  pre {
    background-color: var(--background-color);
    border-radius: var(--border-radius);
    padding: 16px;
    overflow: auto;
    margin-bottom: 16px;
    
    code {
      background-color: transparent;
      padding: 0;
      white-space: pre;
    }
  }
  
  blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 16px;
    margin-left: 0;
    margin-right: 0;
    color: var(--text-secondary);
  }
  
  table {
    display: block;
    width: 100%;
    overflow: auto;
    border-collapse: collapse;
    margin-bottom: 16px;
  }
  
  table th, table td {
    border: 1px solid var(--border-color);
    padding: 6px 13px;
  }
  
  table tr {
    background-color: var(--surface-color);
    border-top: 1px solid var(--border-color);
  }
  
  table tr:nth-child(2n) {
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const HomeButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-on-primary);
  background-color: transparent;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-speed);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const AppLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  color: var(--text-on-primary);
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color var(--transition-speed);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
`;

const ToolbarButton = styled.button`
  padding: 6px 12px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-speed);
  
  &:hover {
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-color: var(--primary-color);
  }
`;

// Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
  </svg>
);

const MarkdownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6H20.56C21.35 6 22 6.63 22 7.41V16.59C22 17.37 21.35 18 20.56 18ZM6.81 15.19V11.53L8.73 13.88L10.65 11.53V15.19H12.58V8.81H10.65L8.73 11.16L6.81 8.81H4.89V15.19H6.81ZM18.69 10.73H16.76V8.81H14.84V10.73H12.92V12.65H14.84V14.58H16.76V12.65H18.69V10.73Z" fill="currentColor"/>
  </svg>
);

// Sample markdown text
const sampleMarkdown = `# Markdown Editor

This is a sample markdown document. You can edit it in the left panel and see the preview on the right.

## Features

- Real-time preview
- Syntax highlighting
- Common markdown formatting

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Tables

| Feature | Status |
|---------|--------|
| Editor  | ✅     |
| Preview | ✅     |
| Export  | ⏳     |

> **Note:** This is a simple markdown editor for demonstration purposes.
`;

// Simple markdown parser
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    
    // Lists
    .replace(/^\s*\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n)+/g, (match) => `<ul>${match}</ul>`)
    
    // Number lists
    .replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n)+/g, (match) => {
      if (match.startsWith('<ul>')) return match;
      return `<ol>${match}</ol>`;
    })
    
    // Blockquotes
    .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Tables - basic support
    .replace(/^\|(.*)\|$/gm, '<tr><td>$1</td></tr>')
    .replace(/<tr>[\s\S]*?<\/tr>/g, (match) => {
      return match.replace(/\|/g, '</td><td>');
    })
    .replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table>$&</table>')
    
    // Paragraphs
    .replace(/^([^<].*?)$/gm, '<p>$1</p>')
    
    // Cleanup empty paragraphs
    .replace(/<p><\/p>/g, '');
  
  return html;
};

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [html, setHtml] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Parse the initial markdown
    setHtml(parseMarkdown(markdown));
  }, []);
  
  useEffect(() => {
    // Update the HTML whenever the markdown changes
    setHtml(parseMarkdown(markdown));
  }, [markdown]);
  
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  const insertText = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);
    
    const newText = beforeText + prefix + selectedText + suffix + afterText;
    setMarkdown(newText);
    
    // Focus back on textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length, 
        end + prefix.length
      );
    }, 0);
  };
  
  const handleHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertText(prefix);
  };
  
  const handleBold = () => {
    insertText('**', '**');
  };
  
  const handleItalic = () => {
    insertText('*', '*');
  };
  
  const handleLink = () => {
    insertText('[', '](url)');
  };
  
  const handleCode = () => {
    insertText('`', '`');
  };
  
  const handleCodeBlock = () => {
    insertText('```\n', '\n```');
  };
  
  const handleList = () => {
    insertText('- ');
  };
  
  const handleNumberedList = () => {
    insertText('1. ');
  };
  
  const handleBlockquote = () => {
    insertText('> ');
  };
  
  const handleTable = () => {
    insertText('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n');
  };
  
  return (
    <Container>
      <Header>
        <AppLogo>
          <HomeButton to="/">
            <HomeIcon />
            Home
          </HomeButton>
          <MarkdownIcon />
          <Title>Markdown Editor</Title>
        </AppLogo>
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </Header>
      
      <EditorContainer>
        <EditorSection>
          <SectionTitle>Edit Markdown</SectionTitle>
          <Toolbar>
            <ToolbarButton onClick={() => handleHeading(1)}>H1</ToolbarButton>
            <ToolbarButton onClick={() => handleHeading(2)}>H2</ToolbarButton>
            <ToolbarButton onClick={() => handleHeading(3)}>H3</ToolbarButton>
            <ToolbarButton onClick={handleBold}>Bold</ToolbarButton>
            <ToolbarButton onClick={handleItalic}>Italic</ToolbarButton>
            <ToolbarButton onClick={handleLink}>Link</ToolbarButton>
            <ToolbarButton onClick={handleCode}>Code</ToolbarButton>
            <ToolbarButton onClick={handleCodeBlock}>Code Block</ToolbarButton>
            <ToolbarButton onClick={handleList}>List</ToolbarButton>
            <ToolbarButton onClick={handleNumberedList}>Numbered List</ToolbarButton>
            <ToolbarButton onClick={handleBlockquote}>Quote</ToolbarButton>
            <ToolbarButton onClick={handleTable}>Table</ToolbarButton>
          </Toolbar>
          <TextArea 
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Enter markdown here..."
            aria-label="Markdown input"
          />
        </EditorSection>
        
        <PreviewSection>
          <SectionTitle>Preview</SectionTitle>
          <Preview dangerouslySetInnerHTML={{ __html: html }} />
        </PreviewSection>
      </EditorContainer>
    </Container>
  );
};

export default MarkdownEditor; 