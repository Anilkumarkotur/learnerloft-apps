import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';

// Define interfaces directly to avoid import issues
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

interface QuizQuestionType {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

interface ParticipantType {
  id: string;
  name: string;
  answers: { questionId: string; answer: number; timeTaken: number }[];
  score: number;
  quizId: string;
  completedAt?: number;
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

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 600;
`;

const TableRow = styled.tr<{ isHighlighted?: boolean }>`
  background-color: ${props => props.isHighlighted ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent'};
  
  &:hover {
    background-color: var(--hover-overlay);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const RankCell = styled(TableCell)`
  font-weight: 600;
  width: 60px;
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  color: var(--primary-color);
  width: 100px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary);
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
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  padding: 0.75rem;
  border: 1px solid var(--error-color);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
`;

const QuizLeaderboard: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!quizId) {
      setError('No quiz ID provided');
      setLoading(false);
      return;
    }
    
    try {
      // Load quiz data
      const quizData = localStorage.getItem(`quiz-${quizId}`);
      if (!quizData) {
        setError('Quiz not found');
        setLoading(false);
        return;
      }
      
      const parsedQuiz = JSON.parse(quizData) as QuizType;
      setQuiz(parsedQuiz);
      
      // Load participants data
      const participantsData = localStorage.getItem(`quiz-participants-${quizId}`) || '[]';
      const parsedParticipants = JSON.parse(participantsData) as ParticipantType[];
      
      // Sort by score (highest first)
      const sortedParticipants = sortParticipants(parsedParticipants, 'score');
      
      setParticipants(sortedParticipants);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load quiz data:', err);
      setError('Failed to load quiz data. Please try again.');
      setLoading(false);
    }
  }, [quizId]);
  
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const sortParticipants = (participants: ParticipantType[], sortBy: string) => {
    return [...participants].sort((a, b) => {
      if (sortBy === 'score') {
        return b.score - a.score;
      } else if (sortBy === 'time') {
        // Use optional chaining to safely access completedAt
        const timeA = a.completedAt || 0;
        const timeB = b.completedAt || 0;
        return timeA - timeB;
      }
      return 0;
    });
  };
  
  if (loading) {
    return (
      <Container>
        <p>Loading leaderboard...</p>
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
  
  return (
    <Container>
      <Header>
        <Title>Leaderboard: {quiz.title}</Title>
        <Description>
          {participants.length} {participants.length === 1 ? 'participant' : 'participants'} have completed this quiz
        </Description>
      </Header>
      
      {participants.length > 0 ? (
        <LeaderboardTable>
          <thead>
            <tr>
              <TableHeader>Rank</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Score</TableHeader>
              <TableHeader>Completed</TableHeader>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <TableRow key={participant.id}>
                <RankCell>{index + 1}</RankCell>
                <TableCell>{participant.name}</TableCell>
                <ScoreCell>{participant.score} / {quiz.questions.length}</ScoreCell>
                <TableCell><span>{formatDate(participant.completedAt || null)}</span></TableCell>
              </TableRow>
            ))}
          </tbody>
        </LeaderboardTable>
      ) : (
        <EmptyState>
          <p>No participants have completed this quiz yet.</p>
        </EmptyState>
      )}
      
      <ButtonContainer>
        <Button onClick={() => navigate(`/quiz/${quizId}`)}>Return to Quiz</Button>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </ButtonContainer>
    </Container>
  );
};

export default QuizLeaderboard; 