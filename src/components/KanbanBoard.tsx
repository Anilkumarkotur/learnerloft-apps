import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Link, useParams, useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

// Types for our Kanban board
interface KanbanCard {
  id: string;
  content: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

// React 19 compatibility wrapper for Droppable
const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // This is needed to ensure drag and drop works in React 19 strict mode
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <Droppable {...props}>
      {(provided, snapshot) => children(provided, snapshot)}
    </Droppable>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.theme.backgroundColor};
  color: ${props => props.theme.textColor};
  transition: all 0.3s ease;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background-color: ${props => props.theme.headerBackground};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HomeButton = styled(Link)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.primaryColor};
  text-decoration: none;
  margin-right: 1rem;
  
  &:hover {
    color: ${props => props.theme.accentColor};
  }
`;

const Title = styled.h1`
  margin: 0;
  flex-grow: 1;
  font-size: 1.5rem;
`;

const ThemeToggle = styled.button`
  background: ${props => props.theme.toggleBackground};
  color: ${props => props.theme.toggleColor};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-left: 1rem;
  
  &:hover {
    background: ${props => props.theme.toggleHoverBackground};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 2rem;
  text-align: center;
`;

const ComingSoonTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.primaryColor};
`;

const ComingSoonMessage = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Initial data check and loading
const loadBoardData = (boardId: string | undefined) => {
  if (!boardId) return initialData;
  
  try {
    const savedData = localStorage.getItem(`kanban-board-${boardId}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Error loading board data:", error);
  }
  
  return initialData;
};

// Sample initial data
const initialData: KanbanColumn[] = [
  {
    id: 'column-1',
    title: 'To Do',
    cards: [
      { id: 'card-1', content: 'Create project structure' },
      { id: 'card-2', content: 'Design UI components' },
      { id: 'card-3', content: 'Set up development environment' }
    ]
  },
  {
    id: 'column-2',
    title: 'In Progress',
    cards: [
      { id: 'card-4', content: 'Implement authentication' },
      { id: 'card-5', content: 'Build dashboard layout' }
    ]
  },
  {
    id: 'column-3',
    title: 'Done',
    cards: [
      { id: 'card-6', content: 'Project planning' },
      { id: 'card-7', content: 'Requirements gathering' }
    ]
  }
];

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  height: 100%;
  align-items: flex-start;
  overflow-x: auto;
  padding: 0.5rem;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 4px;
  }
`;

const ColumnActionButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  
  &:hover {
    background-color: var(--hover-overlay);
    color: var(--primary-color);
  }
`;

const AddColumnForm = styled.div`
  width: 280px;
  padding: 1rem;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--text-primary);
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    
    button {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      
      &:first-child {
        background-color: var(--primary-color);
        color: white;
      }
      
      &:last-child {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
      }
    }
  }
`;

// Main Component
const KanbanBoard: React.FC = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const navigate = useNavigate();
  const [columns, setColumns] = useState<KanbanColumn[]>(() => loadBoardData(boardId));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [addingCardToColumnId, setAddingCardToColumnId] = useState<string | null>(null);
  const [newCardContent, setNewCardContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(!boardId);
  const [boardLink, setBoardLink] = useState('');
  const [boardName, setBoardName] = useState('My Kanban Board');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [pendingMove, setPendingMove] = useState<{
    source: any;
    destination: any;
    draggableId: string;
  } | null>(null);
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Load theme preference and board name from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // If board ID exists, load the board name
    if (boardId) {
      const savedBoardName = localStorage.getItem(`kanban-name-${boardId}`);
      if (savedBoardName) {
        setBoardName(savedBoardName);
      }
      
      // Set board link for sharing
      const link = `${window.location.origin}/kanban-board/${boardId}`;
      setBoardLink(link);
    } else if (!isModalOpen) {
      // If no board ID and modal is closed, open the modal
      setIsModalOpen(true);
      
      // Generate a new board link if there's none
      if (!boardLink) {
        const newBoardId = nanoid(10);
        const link = `${window.location.origin}/kanban-board/${newBoardId}`;
        setBoardLink(link);
      }
    }
  }, [boardId, isModalOpen, boardLink]);

  // Save board data whenever it changes
  useEffect(() => {
    if (boardId) {
      localStorage.setItem(`kanban-board-${boardId}`, JSON.stringify(columns));
    }
  }, [columns, boardId]);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    const newTheme = !isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const createNewBoard = () => {
    const newBoardId = nanoid(10);
    const link = `${window.location.origin}/kanban-board/${newBoardId}`;
    setBoardLink(link);
    setIsModalOpen(true);
  };

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(boardLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
      
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = boardLink;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const redirectToBoard = () => {
    if (!boardLink) {
      // Generate a new board ID if there's no link
      const newBoardId = nanoid(10);
      
      // Store board name in localStorage
      localStorage.setItem(`kanban-name-${newBoardId}`, boardName.trim());
      
      // Save initial board data
      localStorage.setItem(`kanban-board-${newBoardId}`, JSON.stringify(columns));
      
      // Navigate to the board
      navigate(`/kanban-board/${newBoardId}`);
    } else {
      // Extract board ID from link
      const newBoardId = boardLink.split('/').pop();
      
      // Store board name in localStorage
      if (newBoardId && boardName.trim()) {
        localStorage.setItem(`kanban-name-${newBoardId}`, boardName.trim());
        
        // Save initial board data
        localStorage.setItem(`kanban-board-${newBoardId}`, JSON.stringify(columns));
      }
      
      // Navigate to the board
      navigate(`/kanban-board/${newBoardId}`);
    }
    
    // Close the modal
    setIsModalOpen(false);
  };

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If there's no destination or if the item is dropped back where it started
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // For column movement, ask for confirmation
    if (type === 'COLUMN') {
      setPendingMove({
        source,
        destination,
        draggableId
      });
      setShowMoveConfirmation(true);
      return;
    }

    // Handle card movement (no confirmation needed)
    moveCard(source, destination, draggableId);
  };

  // Confirm column movement
  const confirmColumnMove = () => {
    if (!pendingMove) return;
    
    const { source, destination, draggableId } = pendingMove;
    
    // Perform the column reordering
    const newColumnOrder = Array.from(columns);
    const movedColumn = newColumnOrder.splice(source.index, 1)[0];
    newColumnOrder.splice(destination.index, 0, movedColumn);
    
    setColumns(newColumnOrder);
    
    // Reset pendingMove and close confirmation dialog
    setPendingMove(null);
    setShowMoveConfirmation(false);
  };

  // Cancel column movement
  const cancelColumnMove = () => {
    setPendingMove(null);
    setShowMoveConfirmation(false);
  };

  // Handle card movement (extracted from onDragEnd)
  const moveCard = (source: any, destination: any, draggableId: string) => {
    const sourceColumnIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColumnIndex = columns.findIndex(col => col.id === destination.droppableId);
    
    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;
    
    // Make a copy of our columns
    const newColumns = [...columns];
    
    // Find the card
    const card = newColumns[sourceColumnIndex].cards.find(card => card.id === draggableId);
    if (!card) return;
    
    // Remove card from source column
    newColumns[sourceColumnIndex].cards = newColumns[sourceColumnIndex].cards.filter(
      card => card.id !== draggableId
    );
    
    // Add card to destination column
    newColumns[destColumnIndex].cards.splice(destination.index, 0, card);
    
    // Update state
    setColumns(newColumns);
  };

  // Add a new card to a column
  const startAddingCard = (columnId: string) => {
    setAddingCardToColumnId(columnId);
    setNewCardContent('');
  };

  const cancelAddingCard = () => {
    setAddingCardToColumnId(null);
    setNewCardContent('');
  };

  const confirmAddCard = () => {
    if (!addingCardToColumnId || !newCardContent.trim()) {
      cancelAddingCard();
      return;
    }

    const newCard: KanbanCard = {
      id: `card-${nanoid()}`,
      content: newCardContent.trim()
    };

    const newColumns = columns.map(column => {
      if (column.id === addingCardToColumnId) {
        return {
          ...column,
          cards: [...column.cards, newCard]
        };
      }
      return column;
    });

    setColumns(newColumns);
    cancelAddingCard();
  };

  // Add a new column with custom name
  const startAddingColumn = () => {
    setIsAddingColumn(true);
    setNewColumnTitle('');
  };

  const cancelAddingColumn = () => {
    setIsAddingColumn(false);
    setNewColumnTitle('');
  };

  const confirmAddColumn = () => {
    if (!newColumnTitle.trim()) {
      cancelAddingColumn();
      return;
    }

    const newColumn: KanbanColumn = {
      id: `column-${nanoid()}`,
      title: newColumnTitle.trim(),
      cards: []
    };

    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    cancelAddingColumn();
  };

  return (
    <Container>
      <Header>
        <HomeButton to="/">
          <HomeIcon /> Home
        </HomeButton>
        <Title>Kanban Board</Title>
        <ThemeToggle onClick={toggleTheme}>
          Toggle Theme
        </ThemeToggle>
      </Header>
      
      <Content>
        <ComingSoonTitle>Coming Soon!</ComingSoonTitle>
        <ComingSoonMessage>
          Our Kanban Board feature is currently under development. We're working hard to bring you 
          a powerful tool for visualizing and managing your workflow. Please check back later!
        </ComingSoonMessage>
        <HomeButton to="/" style={{ fontSize: '1.2rem', padding: '0.75rem 1.5rem', borderRadius: '4px', background: '#4a6fa5', color: 'white' }}>
          Return to Home
        </HomeButton>
      </Content>
    </Container>
  );
};

export default KanbanBoard;