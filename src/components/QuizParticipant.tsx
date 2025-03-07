import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

// Define interfaces directly to avoid import issues
interface QuizQuestionType {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
  timeLimit: number;
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

interface QuizParticipantType {
  id: string;
  name: string;
  answers: { questionId: string; answer: number; timeTaken: number }[];
  score: number;
  quizId: string;
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
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1rem;
`;

const QuestionContainer = styled.div`
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
`;

const QuestionText = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionButton = styled.button<{ selected?: boolean }>`
  padding: 1rem;
  border: 1px solid ${props => props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--border-radius);
  background-color: ${props => props.selected ? 'rgba(var(--primary-color-rgb), 0.1)' : 'var(--surface-color)'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }
`;

const TimerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--primary-color);
  height: 5px;
  z-index: 1000;
`;

const TimerBar = styled.div<{ width: number }>`
  height: 100%;
  background-color: var(--error-color);
  width: ${props => props.width}%;
  transition: width 1s linear;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
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

const ProgressText = styled.div`
  text-align: right;
  color: var(--text-secondary);
  margin-bottom: 1rem;
`;

const ParticipantForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
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

const ErrorMessage = styled.div`
  color: var(--error-color);
  padding: 0.75rem;
  border: 1px solid var(--error-color);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
`;

const ResultContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ScoreDisplay = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
  color: var(--primary-color);
`;

const WaitingContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const QuizParticipant: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [name, setName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{
    questionId: string;
    selectedOption: number;
    timeSpent: number;
  }[]>([]);
  
  // Load quiz data
  useEffect(() => {
    if (!quizId) {
      setError('No quiz ID provided');
      setLoading(false);
      return;
    }
    
    try {
      const quizData = localStorage.getItem(`quiz-${quizId}`);
      
      if (!quizData) {
        setError('Quiz not found');
        setLoading(false);
        return;
      }
      
      const parsedQuiz = JSON.parse(quizData) as QuizType;
      setQuiz(parsedQuiz);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setError('Failed to load quiz. Please try again.');
      setLoading(false);
    }
  }, [quizId]);
  
  // Timer for the current question
  useEffect(() => {
    if (!isStarted || !quiz || isCompleted) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // Set initial time
    setTimeLeft(currentQuestion.timeLimit);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestionIndex, isStarted, quiz, isCompleted]);
  
  const handleTimeout = () => {
    if (!quiz) return;
    
    // Record no answer
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    // Add this answer to our list
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: -1, // -1 means no answer
        timeSpent: currentQuestion.timeLimit
      }
    ]);
    
    // Move to next question or finish
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };
  
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || name.trim() === '') {
      setError('Please enter your name to start the quiz');
      return;
    }
    
    setIsStarted(true);
    setError('');
  };
  
  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };
  
  const handleNextQuestion = () => {
    if (!quiz || selectedOption === null) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const timeSpent = currentQuestion.timeLimit - timeLeft;
    
    // Add this answer to our list
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption,
        timeSpent
      }
    ]);
    
    // Move to next question
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };
  
  const finishQuiz = () => {
    if (!quiz) return;
    
    // Calculate score
    let totalScore = 0;
    answers.forEach(answer => {
      const question = quiz.questions.find((q: any) => q.id === answer.questionId);
      if (question && answer.selectedOption === question.correctAnswer) {
        totalScore++;
      }
    });
    
    // Create participant record
    const participantResult: QuizParticipantType = {
      id: nanoid(),
      name,
      score: totalScore,
      quizId: quizId || '', // Add fallback for undefined quizId
      answers: answers.map(a => ({
        questionId: a.questionId,
        answer: a.selectedOption,
        timeTaken: a.timeSpent
      }))
    };
    
    // Save to localStorage
    const participantsData = localStorage.getItem(`quiz-participants-${quizId}`) || '[]';
    const participants = JSON.parse(participantsData) as QuizParticipantType[];
    participants.push(participantResult);
    localStorage.setItem(`quiz-participants-${quizId}`, JSON.stringify(participants));
    
    setScore(totalScore);
    setIsCompleted(true);
  };
  
  if (loading) {
    return (
      <Container>
        <p>Loading quiz...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }
  
  if (!quiz) {
    return (
      <Container>
        <ErrorMessage>Quiz not found</ErrorMessage>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }
  
  if (!isStarted) {
    return (
      <Container>
        <Header>
          <Title>{quiz.title}</Title>
          {quiz.description && <Description>{quiz.description}</Description>}
          <p>{quiz.questions.length} questions - Timed</p>
        </Header>
        
        <ParticipantForm onSubmit={handleStartQuiz}>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button primary type="submit">Start Quiz</Button>
        </ParticipantForm>
        
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    );
  }
  
  if (isCompleted) {
    return (
      <Container>
        <ResultContainer>
          <Title>Quiz Completed!</Title>
          <p>Thank you for participating, {name}!</p>
          <ScoreDisplay>
            {score} / {quiz.questions.length}
          </ScoreDisplay>
          <p>Your responses have been recorded.</p>
          <ButtonContainer>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
            <Button primary onClick={() => navigate(`/quiz/${quizId}/leaderboard`)}>
              View Leaderboard
            </Button>
          </ButtonContainer>
        </ResultContainer>
      </Container>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const timerPercentage = (timeLeft / currentQuestion.timeLimit) * 100;
  
  return (
    <>
      <TimerContainer>
        <TimerBar width={timerPercentage} />
      </TimerContainer>
    
      <Container>
        <ProgressText>
          Question {currentQuestionIndex + 1} of {quiz.questions.length} - {timeLeft} seconds left
        </ProgressText>
        
        <QuestionContainer>
          <QuestionText>{currentQuestion.text}</QuestionText>
          
          <OptionsContainer>
            {currentQuestion.options.map((option: string, index: number) => (
              <OptionButton
                key={index}
                selected={selectedOption === index}
                onClick={() => handleSelectOption(index)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        </QuestionContainer>
        
        <ButtonContainer>
          <Button disabled>Previous</Button>
          <Button 
            primary 
            onClick={handleNextQuestion} 
            disabled={selectedOption === null}
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </ButtonContainer>
      </Container>
    </>
  );
};

export default QuizParticipant; 