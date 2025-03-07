// Quiz types
export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number; // Index of the correct option
  timeLimit: number; // In seconds
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: number;
  isActive: boolean;
  participantIds: string[];
}

export interface QuizParticipant {
  id: string;
  name: string;
  answers: {
    questionId: string;
    selectedOption: number;
    timeSpent: number;
  }[];
  score: number;
  completedAt: number | null;
} 