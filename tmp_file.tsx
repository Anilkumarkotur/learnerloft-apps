import React from 'react';
import { render, act } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Board from '../../components/Board';

// Mock nanoid to return predictable IDs
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id'
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-drop-context">{children}</div>
  ),
  Droppable: ({ children }: { children: any }) => children({
    droppableProps: {
      'data-testid': 'droppable'
    },
    innerRef: vi.fn()
  }),
  Draggable: ({ children }: { children: any }) => children({
    draggableProps: {
      'data-testid': 'draggable'
    },
    innerRef: vi.fn(),
    dragHandleProps: {}
  })
}));

// Mock Column component
vi.mock('../../components/Column', () => {
  return {
    default: ({ column, cards, handleVote, openCardModal }: any) => (
      <div data-testid={`column-${column.id}`} data-column-id={column.id}>
        <h3>{column.title}</h3>
        <div data-testid="card-list">
          {column.cards.map((cardId: string) => (
            <div 
              key={cardId} 
              data-testid={`card-${cardId}`}
              data-card-id={cardId}
            >
              {cards[cardId]?.content}
              <div className="votes">{cards[cardId]?.votes}</div>
              <button 
                onClick={() => handleVote(column.id, cardId, true)}
                data-testid={`upvote-${cardId}`}
              >
                👍
              </button>
              <button 
                onClick={() => handleVote(column.id, cardId, false)}
                data-testid={`downvote-${cardId}`}
              >
                👎
              </button>
              <button 
                onClick={() => openCardModal(column.id, cardId)}
                data-testid={`edit-${cardId}`}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
        <button 
          onClick={() => openCardModal(column.id)}
          data-testid={`add-card-${column.id}`}
        >
          Add a card
        </button>
      </div>
    )
  };
});

vi.mock('../../components/CardModal', () => {
  return {
    default: ({ card, onSave, onDelete, onClose, onStartMerging }: any) => (
      <div data-testid="card-modal">
        <textarea 
          data-testid="card-content" 
          defaultValue={card?.content || ''}
        ></textarea>
        <button 
          onClick={() => onSave((document.querySelector('[data-testid="card-content"]') as HTMLTextAreaElement).value)}
          data-testid="save-card"
        >
          Save
        </button>
        {card && (
          <>
            <button onClick={onDelete} data-testid="delete-card">Delete</button>
            {onStartMerging && (
              <button onClick={onStartMerging} data-testid="start-merging">
                Start Merging
              </button>
            )}
          </>
        )}
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    )
  };
});

describe('Board Component', () => {
  let ref: React.RefObject<any>;
  
  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock.clear();
    ref = React.createRef();
  });
  
  it('renders all columns', () => {
    render(<Board ref={ref} />);
    
    expect(screen.getByText('What went well')).toBeInTheDocument();
    expect(screen.getByText('What can be improved')).toBeInTheDocument();
    expect(screen.getByText('Action Items')).toBeInTheDocument();
    
    // Check if all initial cards are rendered
    expect(screen.getByText('Completed sprint goals')).toBeInTheDocument();
    expect(screen.getByText('Team communication')).toBeInTheDocument();
    expect(screen.getByText('Meeting efficiency')).toBeInTheDocument();
    expect(screen.getByText('Create meeting agenda template')).toBeInTheDocument();
  });
  
  it('opens card modal when "Add a card" button is clicked', () => {
    render(<Board ref={ref} />);
    
    const addButton = screen.getByTestId('add-card-column-1');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('card-modal')).toBeInTheDocument();
    expect(screen.getByTestId('save-card')).toBeInTheDocument();
    expect(screen.queryByTestId('delete-card')).not.toBeInTheDocument(); // Should not show delete for new cards
  });
  
  it('opens card modal with content when edit button is clicked', () => {
    render(<Board ref={ref} />);
    
    const editButton = screen.getByTestId('edit-card-1');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('card-modal')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toHaveValue('Completed sprint goals');
    expect(screen.getByTestId('delete-card')).toBeInTheDocument();
  });
  
  it('adds a new card when saving in the modal', () => {
    render(<Board ref={ref} />);
    
    // Open modal for adding a card
    const addButton = screen.getByTestId('add-card-column-1');
    fireEvent.click(addButton);
    
    // Enter content and save
    const textarea = screen.getByTestId('card-content');
    fireEvent.change(textarea, { target: { value: 'New test card' } });
    
    const saveButton = screen.getByTestId('save-card');
    fireEvent.click(saveButton);
    
    // Check if new card appears
    expect(screen.getByText('New test card')).toBeInTheDocument();
  });
  
  it('updates a card when editing', () => {
    render(<Board ref={ref} />);
    
    // Open modal for editing a card
    const editButton = screen.getByTestId('edit-card-1');
    fireEvent.click(editButton);
    
    // Update content and save
    const textarea = screen.getByTestId('card-content');
    fireEvent.change(textarea, { target: { value: 'Updated sprint goals' } });
    
    const saveButton = screen.getByTestId('save-card');
    fireEvent.click(saveButton);
    
    // Check if card is updated
    expect(screen.getByText('Updated sprint goals')).toBeInTheDocument();
    expect(screen.queryByText('Completed sprint goals')).not.toBeInTheDocument();
  });
  
  it('deletes a card', () => {
    render(<Board ref={ref} />);
    
    // Open modal for editing a card
    const editButton = screen.getByTestId('edit-card-1');
    fireEvent.click(editButton);
    
    // Delete the card
    const deleteButton = screen.getByTestId('delete-card');
    fireEvent.click(deleteButton);
    
    // Check if card is removed
    expect(screen.queryByText('Completed sprint goals')).not.toBeInTheDocument();
  });
  
  it('increments votes when upvoting', () => {
    render(<Board ref={ref} />);
    
    // Find the initial votes count
    const card1 = screen.getByTestId('card-card-1');
    const initialVotes = card1.querySelector('.votes')?.textContent;
    expect(initialVotes).toBe('3');
    
    // Upvote the card
    const upvoteButton = screen.getByTestId('upvote-card-1');
    fireEvent.click(upvoteButton);
    
    // Check if votes increased
    const updatedVotes = card1.querySelector('.votes')?.textContent;
    expect(updatedVotes).toBe('4');
  });
  
  it('decrements votes when downvoting', () => {
    render(<Board ref={ref} />);
    
    // Find the initial votes count
    const card1 = screen.getByTestId('card-card-1');
    const initialVotes = card1.querySelector('.votes')?.textContent;
    expect(initialVotes).toBe('3');
    
    // Downvote the card
    const downvoteButton = screen.getByTestId('downvote-card-1');
    fireEvent.click(downvoteButton);
    
    // Check if votes decreased
    const updatedVotes = card1.querySelector('.votes')?.textContent;
    expect(updatedVotes).toBe('2');
  });
  
  it('starts merging mode when clicking merge button', () => {
    render(<Board ref={ref} />);
    
    // Open modal for editing a card
    const editButton = screen.getByTestId('edit-card-1');
    fireEvent.click(editButton);
    
    // Start merging
    const mergeButton = screen.getByTestId('start-merging');
    fireEvent.click(mergeButton);
    
    // Check if snackbar appears
    expect(screen.getByText('Select another card to merge with')).toBeInTheDocument();
  });
  
  it('merges cards when selecting a second card in merging mode', () => {
    render(<Board ref={ref} />);
    
    // Open modal for first card and start merging
    const editButton1 = screen.getByTestId('edit-card-1');
    fireEvent.click(editButton1);
    
    const mergeButton = screen.getByTestId('start-merging');
    fireEvent.click(mergeButton);
    
    // Select second card to merge with
    const editButton2 = screen.getByTestId('edit-card-2');
    fireEvent.click(editButton2);
    
    // Check if cards merged (first card content added to second)
    // Since the mock just shows the content directly, we can't fully verify the merge
    // But we can check that the first card is removed
    expect(screen.queryByTestId('card-card-1')).not.toBeInTheDocument();
  });
  
  it('saves board state to localStorage', () => {
    render(<Board ref={ref} boardId="test-board" />);
    
    // Add a new card to trigger state change
    const addButton = screen.getByTestId('add-card-column-1');
    fireEvent.click(addButton);
    
    const textarea = screen.getByTestId('card-content');
    fireEvent.change(textarea, { target: { value: 'Saved card' } });
    
    const saveButton = screen.getByTestId('save-card');
    fireEvent.click(saveButton);
    
    // Check if localStorage was called with the right keys
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'board-test-board',
      expect.any(String)
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cards-test-board',
      expect.any(String)
    );
  });
  
  it('loads board state from localStorage', () => {
    // Setup localStorage with saved state
    const savedBoard = {
      columns: {
        "column-1": {
          id: "column-1",
          title: "Custom Column",
          cards: ["custom-card"]
        }
      },
      columnOrder: ["column-1"]
    };
    
    const savedCards = {
      "custom-card": { id: "custom-card", content: "Loaded from storage", votes: 5 }
    };
    
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'board-test-board') return JSON.stringify(savedBoard);
      if (key === 'cards-test-board') return JSON.stringify(savedCards);
      return null;
    });
    
    // Render with boardId to trigger loading
    render(<Board ref={ref} boardId="test-board" />);
    
    // Check if data was loaded from localStorage
    expect(screen.getByText('Custom Column')).toBeInTheDocument();
    expect(screen.getByText('Loaded from storage')).toBeInTheDocument();
  });
  
  it('exposes board data via ref', () => {
    render(<Board ref={ref} />);
    
    // Get data via ref
    const boardData = ref.current.getBoardData();
    
    // Check that the data structure is correct
    expect(boardData).toHaveProperty('columns');
    expect(boardData).toHaveProperty('columnOrder');
    expect(boardData).toHaveProperty('cards');
    
    // Check that columns contain the right data
    expect(boardData.columns['column-1'].title).toBe('What went well');
    expect(boardData.columnOrder).toContain('column-1');
    expect(boardData.cards['card-1'].content).toBe('Completed sprint goals');
  });
}); 
