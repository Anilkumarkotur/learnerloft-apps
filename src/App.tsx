import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RetroBoardPage from './pages/RetroBoardPage';
import TodoListPage from './pages/TodoListPage';
import Board from './components/Board';
import KanbanBoard from './components/KanbanBoard';
import QuizCreator from './components/QuizCreator';
import QuizParticipant from './components/QuizParticipant';
import QuizLeaderboard from './components/QuizLeaderboard';
import JsonFormatter from './components/JsonFormatter';
import MarkdownEditor from './components/MarkdownEditor';
import CodeDiffViewer from './components/CodeDiffViewer';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Retro Board Routes */}
        <Route path="/retro/:boardId" element={<RetroBoardPage />} />
        <Route path="/board/:id" element={<Board />} />
        
        {/* Kanban Board Routes */}
        <Route path="/kanban-board" element={<KanbanBoard />} />
        <Route path="/kanban-board/:boardId" element={<KanbanBoard />} />
        <Route path="/kanban/:id" element={<KanbanBoard />} />
        
        {/* Todo List Route */}
        <Route path="/todo-list" element={<TodoListPage />} />
        
        {/* Quiz Routes */}
        <Route path="/quiz-creator" element={<QuizCreator />} />
        <Route path="/quiz/:quizId/participate" element={<QuizParticipant />} />
        <Route path="/quiz/:quizId/leaderboard" element={<QuizLeaderboard />} />
        <Route path="/quiz/:quizId" element={<QuizParticipant />} />
        
        {/* Utility Tool Routes */}
        <Route path="/json-formatter" element={<JsonFormatter />} />
        <Route path="/markdown-editor" element={<MarkdownEditor />} />
        <Route path="/code-diff-viewer" element={<CodeDiffViewer />} />
        
        {/* Default route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
