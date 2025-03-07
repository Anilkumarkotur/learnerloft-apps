import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const FormatterContainer = styled.div`
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

const InputSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--elevation-1);
`;

const OutputSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--elevation-1);
`;

const TextareaLabel = styled.label`
  font-weight: 500;
  color: var(--text-primary);
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 400px;
  flex: 1;
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

const ErrorMessage = styled.div`
  color: var(--error-color);
  padding: 10px;
  border-radius: var(--border-radius);
  background-color: rgba(244, 67, 54, 0.1);
  margin-top: 10px;
  font-size: 14px;
`;

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
  </svg>
);

const JsonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" fillOpacity="0.7"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 14L10 16L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 14L14 16L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  
  // Load theme from localStorage on component mount
  React.useEffect(() => {
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
  
  const formatJson = (indent = 2) => {
    try {
      if (!input.trim()) {
        setError('Please enter JSON to format');
        return;
      }
      
      const parsedJson = JSON.parse(input);
      setOutput(JSON.stringify(parsedJson, null, indent));
      setError(null);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
    }
  };
  
  const minifyJson = () => {
    try {
      if (!input.trim()) {
        setError('Please enter JSON to minify');
        return;
      }
      
      const parsedJson = JSON.parse(input);
      setOutput(JSON.stringify(parsedJson));
      setError(null);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
    }
  };
  
  const validateJson = () => {
    try {
      if (!input.trim()) {
        setError('Please enter JSON to validate');
        return;
      }
      
      JSON.parse(input);
      setError(null);
      setOutput('JSON is valid!');
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
    }
  };
  
  const copyToClipboard = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus('Copied to clipboard!');
      
      // Clear status after 2 seconds
      setTimeout(() => {
        setCopyStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setCopyStatus('Failed to copy. Try again.');
      
      // Clear error status after 3 seconds
      setTimeout(() => {
        setCopyStatus(null);
      }, 3000);
    }
  };
  
  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setCopyStatus(null);
  };
  
  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <HomeButton to="/">
            <HomeIcon /> Home
          </HomeButton>
          <AppLogo>
            <JsonIcon />
            <Title>JSON Formatter</Title>
          </AppLogo>
        </div>
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </Header>
      
      <FormatterContainer>
        <InputSection>
          <TextareaLabel htmlFor="json-input">Input JSON</TextareaLabel>
          <Textarea 
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Enter your JSON here, e.g. {"name": "John", "age": 30, "city": "New York"}'
          />
          <ButtonGroup>
            <Button $primary onClick={() => formatJson(2)}>
              Format
            </Button>
            <Button onClick={() => formatJson(4)}>
              Format (4 spaces)
            </Button>
            <Button onClick={minifyJson}>
              Minify
            </Button>
            <Button onClick={validateJson}>
              Validate
            </Button>
            <Button onClick={clearAll}>
              Clear
            </Button>
          </ButtonGroup>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputSection>
        
        <OutputSection>
          <TextareaLabel htmlFor="json-output">Formatted JSON</TextareaLabel>
          <Textarea 
            id="json-output"
            value={output}
            readOnly
            placeholder="Formatted output will appear here"
          />
          <ButtonGroup>
            <Button 
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copyStatus || 'Copy to Clipboard'}
            </Button>
          </ButtonGroup>
        </OutputSection>
      </FormatterContainer>
    </Container>
  );
};

export default JsonFormatter; 