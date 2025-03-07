import React, { useState } from 'react';
import styled from 'styled-components';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
// Define interfaces directly rather than importing from types file
// to avoid import issues

interface QuizQuestionType {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number; // Index of the correct option
  timeLimit: number; // In seconds
}

interface QuizType {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestionType[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
  participantIds: string[];
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-1);
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const QuizForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-background);
  color: var(--text-primary);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-background);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'var(--surface-color)'};
  color: ${props => props.primary ? 'var(--text-on-primary)' : 'var(--text-primary)'};
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--elevation-1);
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--elevation-2);
    background-color: ${props => props.primary ? 'var(--primary-color-dark)' : 'var(--surface-color-dark)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const QuestionCard = styled.div`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--surface-color);
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-background);
  color: var(--text-primary);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Radio = styled.input`
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: var(--success-background);
  color: var(--success-color);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
`;

const ConfirmationCard = styled.div`
  padding: 2rem;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-2);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const LinkDisplay = styled.div`
  padding: 1rem;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  margin: 1rem 0;
  word-break: break-all;
  font-family: monospace;
`;

const CopyButton = styled(Button)`
  margin-top: 1rem;
`;

interface QuizCreatorProps {
  // No specific props needed for now
}

const QuizCreator: React.FC<QuizCreatorProps> = () => {
  const navigate = useNavigate();
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestionType>>({
    text: '',
    type: 'multiple-choice',
    options: ['', ''],
    correctAnswer: 0,
    timeLimit: 30
  });
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [quizLink, setQuizLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const addOption = () => {
    if (currentQuestion.options && currentQuestion.options.length < 6) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, '']
      });
    }
  };
  
  const removeOption = (index: number) => {
    if (currentQuestion.options && currentQuestion.options.length > 2) {
      const newOptions = [...currentQuestion.options];
      newOptions.splice(index, 1);
      
      // Adjust correct answer if needed
      let newCorrectAnswer = currentQuestion.correctAnswer;
      if (currentQuestion.correctAnswer === index) {
        newCorrectAnswer = 0;
      } else if (currentQuestion.correctAnswer && currentQuestion.correctAnswer > index) {
        newCorrectAnswer = currentQuestion.correctAnswer - 1;
      }
      
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
        correctAnswer: newCorrectAnswer
      });
    }
  };
  
  const handleOptionChange = (index: number, value: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions
      });
    }
  };
  
  const handleQuestionTypeChange = (type: 'multiple-choice' | 'true-false') => {
    if (type === 'true-false') {
      setCurrentQuestion({
        ...currentQuestion,
        type,
        options: ['True', 'False'],
        correctAnswer: 0
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        type,
        options: currentQuestion.options?.length === 2 ? ['', ''] : currentQuestion.options,
        correctAnswer: 0
      });
    }
  };
  
  const validateQuestion = () => {
    if (!currentQuestion.text) {
      alert('Please provide a question');
      return false;
    }
    
    // For multiple-choice questions, ensure we have at least 2 options
    if (currentQuestion.type === 'multiple-choice') {
      // Check if options exist and have at least 2 items
      if (!currentQuestion.options || currentQuestion.options.length < 2) {
        alert('Please provide at least 2 options for multiple choice questions');
        return false;
      }
    }
    
    // Check if correct answer is valid
    if (currentQuestion.correctAnswer === undefined || 
        (currentQuestion.options && 
         (currentQuestion.correctAnswer < 0 || 
          currentQuestion.correctAnswer >= currentQuestion.options.length))) {
      alert('Please select a valid correct answer');
      return false;
    }
    
    return true;
  };
  
  const addQuestion = () => {
    if (!validateQuestion()) return;
    
    const newQuestion: QuizQuestionType = {
      id: nanoid(),
      text: currentQuestion.text || '',
      type: currentQuestion.type || 'multiple-choice',
      options: currentQuestion.options || [],
      correctAnswer: currentQuestion.correctAnswer || 0,
      timeLimit: currentQuestion.timeLimit || 30
    };
    
    if (editing !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editing] = newQuestion;
      setQuestions(updatedQuestions);
      setEditing(null);
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
    }
    
    // Reset form for next question
    setCurrentQuestion({
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswer: 0,
      timeLimit: 30
    });
    
    setError('');
  };
  
  const editQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditing(index);
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    
    if (editing === index) {
      setEditing(null);
      setCurrentQuestion({
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswer: 0,
        timeLimit: 30
      });
    }
  };
  
  const validateQuiz = (): boolean => {
    if (!quizTitle || quizTitle.trim() === '') {
      setError('Quiz title is required');
      return false;
    }
    
    if (questions.length === 0) {
      setError('At least one question is required');
      return false;
    }
    
    return true;
  };
  
  const createQuiz = () => {
    if (!validateQuiz()) return;
    
    const quizId = nanoid(10);
    const newQuiz: QuizType = {
      id: quizId,
      title: quizTitle,
      description: quizDescription,
      questions,
      createdBy: 'current-user', // In a real app, get this from auth context
      createdAt: Date.now(),
      isActive: true,
      participantIds: []
    };
    
    // Save to localStorage
    localStorage.setItem(`quiz-${quizId}`, JSON.stringify(newQuiz));
    
    // Generate shareable link
    const quizUrl = `${window.location.origin}/quiz/${quizId}`;
    setQuizLink(quizUrl);
    setIsCreated(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const goToQuiz = () => {
    const quizId = quizLink.split('/').pop();
    navigate(`/quiz/${quizId}`);
  };
  
  if (isCreated) {
    return (
      <ConfirmationCard>
        <Title>Quiz Created Successfully!</Title>
        <p>Share this link with your team to start the quiz:</p>
        <LinkDisplay>{quizLink}</LinkDisplay>
        <CopyButton onClick={copyToClipboard}>
          {copySuccess ? 'Copied!' : 'Copy Link'}
        </CopyButton>
        <ButtonGroup>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
          <Button primary onClick={goToQuiz}>Go to Quiz</Button>
        </ButtonGroup>
      </ConfirmationCard>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>Create a New Quiz</Title>
        <p>Set up your questions, options, and time limits for each question.</p>
      </Header>
      
      <QuizForm onSubmit={(e) => e.preventDefault()}>
        <FormGroup>
          <Label htmlFor="quiz-title">Quiz Title</Label>
          <Input
            id="quiz-title"
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter a title for your quiz"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="quiz-description">Description (Optional)</Label>
          <TextArea
            id="quiz-description"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            placeholder="Provide some context or instructions for participants"
          />
        </FormGroup>
        
        <div>
          <h2>Questions</h2>
          {questions.length > 0 && (
            <QuestionList>
              {questions.map((q, index) => (
                <QuestionCard key={q.id}>
                  <QuestionHeader>
                    <QuestionTitle>
                      {index + 1}. {q.text} ({q.timeLimit}s)
                    </QuestionTitle>
                    <ButtonGroup>
                      <Button onClick={() => editQuestion(index)}>Edit</Button>
                      <Button onClick={() => removeQuestion(index)}>Remove</Button>
                    </ButtonGroup>
                  </QuestionHeader>
                  <OptionList>
                    {q.options.map((option: string, optIndex: number) => (
                      <OptionItem key={optIndex}>
                        <Radio 
                          type="radio" 
                          checked={q.correctAnswer === optIndex}
                          readOnly 
                        />
                        {option}
                      </OptionItem>
                    ))}
                  </OptionList>
                </QuestionCard>
              ))}
            </QuestionList>
          )}
          
          <FormGroup style={{ marginTop: '2rem' }}>
            <h3>{editing !== null ? 'Edit Question' : 'Add a Question'}</h3>
            <Label htmlFor="question-text">Question Text</Label>
            <Input
              id="question-text"
              type="text"
              value={currentQuestion.text}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
              placeholder="Enter your question"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="question-type">Question Type</Label>
            <Select
              id="question-type"
              value={currentQuestion.type}
              onChange={(e) => handleQuestionTypeChange(e.target.value as 'multiple-choice' | 'true-false')}
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="time-limit">Time Limit (seconds)</Label>
            <Input
              id="time-limit"
              type="number"
              min="5"
              max="300"
              value={currentQuestion.timeLimit}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: parseInt(e.target.value) })}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Options</Label>
            <OptionList>
              {currentQuestion.options?.map((option: string, index: number) => (
                <OptionItem key={index}>
                  <Radio
                    type="radio"
                    name="correct-answer"
                    checked={currentQuestion.correctAnswer === index}
                    onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                  />
                  <Input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={currentQuestion.type === 'true-false'}
                  />
                  {currentQuestion.type !== 'true-false' && (
                    <Button onClick={() => removeOption(index)} disabled={currentQuestion.options?.length <= 2}>
                      Remove
                    </Button>
                  )}
                </OptionItem>
              ))}
            </OptionList>
            
            {currentQuestion.type !== 'true-false' && (
              <Button
                onClick={addOption}
                disabled={currentQuestion.options?.length >= 6}
                style={{ marginTop: '0.5rem' }}
              >
                Add Option
              </Button>
            )}
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <ButtonGroup>
            <Button onClick={() => {
              setCurrentQuestion({
                text: '',
                type: 'multiple-choice',
                options: ['', ''],
                correctAnswer: 0,
                timeLimit: 30
              });
              setEditing(null);
              setError('');
            }}>
              Clear
            </Button>
            <Button primary onClick={addQuestion}>
              {editing !== null ? 'Update Question' : 'Add Question'}
            </Button>
          </ButtonGroup>
        </div>
        
        <ButtonGroup style={{ marginTop: '2rem' }}>
          <Button onClick={() => navigate('/')}>Cancel</Button>
          <Button primary onClick={createQuiz} disabled={questions.length === 0}>
            Create Quiz
          </Button>
        </ButtonGroup>
      </QuizForm>
    </Container>
  );
};

export default QuizCreator; 