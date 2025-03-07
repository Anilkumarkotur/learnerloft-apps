import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Layout components
const Container = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  color: var(--text-primary);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  box-shadow: var(--elevation-2);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  color: var(--text-on-primary);
  font-weight: 600;
`;

const AppLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-on-primary);
`;

const HomeButton = styled(Link)`
  background-color: transparent;
  border: none;
  color: var(--text-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  padding: 8px 12px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
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
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const DiffContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  padding: 20px;
  background-color: var(--background-color);
  overflow: hidden;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const CodeSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--elevation-1);
`;

const DiffSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--elevation-1);
  overflow: auto;
`;

const TextareaLabel = styled.label`
  font-weight: 500;
  color: var(--text-primary);
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 250px;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  color: var(--text-primary);
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: var(--border-radius);
  border: none;
  background-color: ${props => props.$primary ? 'var(--primary-color)' : 'var(--surface-color)'};
  color: ${props => props.$primary ? 'var(--text-on-primary)' : 'var(--text-primary)'};
  cursor: pointer;
  font-weight: 500;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'var(--border-color)'};
  
  &:hover {
    background-color: ${props => props.$primary ? 'var(--primary-dark)' : 'var(--hover-color)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DiffLine = styled.div<{ $type?: 'added' | 'removed' | 'unchanged' }>`
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  padding: 2px 8px;
  white-space: pre;
  background-color: ${props => {
    switch (props.$type) {
      case 'added': return 'rgba(0, 200, 0, 0.1)';
      case 'removed': return 'rgba(255, 0, 0, 0.1)';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'added': return 'var(--success-color)';
      case 'removed': return 'var(--error-color)';
      default: return 'var(--text-primary)';
    }
  }};
  border-left: ${props => {
    switch (props.$type) {
      case 'added': return '3px solid var(--success-color)';
      case 'removed': return '3px solid var(--error-color)';
      default: return '3px solid transparent';
    }
  }};
`;

const LineNumber = styled.span`
  display: inline-block;
  width: 30px;
  margin-right: 10px;
  text-align: right;
  color: var(--text-secondary);
  user-select: none;
`;

const DiffContent = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: auto;
  max-height: 500px;
  background-color: var(--background-color);
`;

// Icons
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
  </svg>
);

const DiffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6Z" fill="currentColor"/>
    <path d="M14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="currentColor"/>
  </svg>
);

const CodeDiffViewer: React.FC = () => {
  const [originalCode, setOriginalCode] = useState('');
  const [modifiedCode, setModifiedCode] = useState('');
  const [diffOutput, setDiffOutput] = useState<Array<{ type: 'added' | 'removed' | 'unchanged', text: string }>>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Simple line-by-line diff algorithm
  const computeDiff = () => {
    if (!originalCode && !modifiedCode) {
      setDiffOutput([]);
      return;
    }

    const originalLines = originalCode.split('\n');
    const modifiedLines = modifiedCode.split('\n');
    const result: Array<{ type: 'added' | 'removed' | 'unchanged', text: string }> = [];

    // This is a simple diff implementation - in a real app, you might use a more sophisticated algorithm
    // or a library like diff or jsdiff
    
    const maxLength = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const origLine = originalLines[i] || '';
      const modLine = modifiedLines[i] || '';
      
      if (origLine === modLine) {
        result.push({ type: 'unchanged', text: origLine });
      } else {
        if (origLine) {
          result.push({ type: 'removed', text: origLine });
        }
        if (modLine) {
          result.push({ type: 'added', text: modLine });
        }
      }
    }
    
    setDiffOutput(result);
  };

  const clearAll = () => {
    setOriginalCode('');
    setModifiedCode('');
    setDiffOutput([]);
  };

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <HomeButton to="/">
            <HomeIcon /> Home
          </HomeButton>
          <AppLogo>
            <DiffIcon />
            <Title>Code Diff Viewer</Title>
          </AppLogo>
        </div>
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </Header>
      
      <DiffContainer>
        <CodeSection>
          <TextareaLabel htmlFor="original-code">Original Code</TextareaLabel>
          <Textarea 
            id="original-code"
            value={originalCode}
            onChange={(e) => setOriginalCode(e.target.value)}
            placeholder="Enter the original code here"
          />
          
          <TextareaLabel htmlFor="modified-code">Modified Code</TextareaLabel>
          <Textarea 
            id="modified-code"
            value={modifiedCode}
            onChange={(e) => setModifiedCode(e.target.value)}
            placeholder="Enter the modified code here"
          />
          
          <ButtonGroup>
            <Button $primary onClick={computeDiff}>
              Compare
            </Button>
            <Button onClick={clearAll}>
              Clear All
            </Button>
          </ButtonGroup>
        </CodeSection>
        
        <DiffSection data-testid="diff-section">
          <TextareaLabel>Differences</TextareaLabel>
          <DiffContent>
            {diffOutput.length > 0 ? (
              diffOutput.map((line, idx) => (
                <DiffLine key={idx} $type={line.type}>
                  <LineNumber>{idx + 1}</LineNumber>
                  {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}
                  {line.text}
                </DiffLine>
              ))
            ) : (
              <DiffLine>No differences to display. Click 'Compare' to see the diff.</DiffLine>
            )}
          </DiffContent>
        </DiffSection>
      </DiffContainer>
    </Container>
  );
};

export default CodeDiffViewer; 