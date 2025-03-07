import React, { useState, forwardRef, useImperativeHandle, useEffect, useCallback } from "react";
import styled from "styled-components";
import { DragDropContext, DropResult, Droppable, Draggable } from "react-beautiful-dnd";
import Column from "./Column";
import CardModal from "./CardModal";
import { Card, Column as ColumnType } from "../types";
import { nanoid } from "nanoid";
import { useParams } from 'react-router-dom';

// StrictModeDroppable component to make react-beautiful-dnd work with React 18's StrictMode
export const StrictModeDroppable = ({ children, ...props }: React.ComponentProps<typeof Droppable>) => {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // Wait for the next tick to enable the Droppable after initial mount
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  
  if (!enabled) {
    return null;
  }
  
  return <Droppable {...props}>{children}</Droppable>;
};

const Container = styled.div`
  display: flex;
  overflow-x: auto;
  padding: calc(var(--spacing-unit) * 2);
  height: calc(100vh - 64px);
  background-color: var(--background-color);
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
    padding: calc(var(--spacing-unit));
  }
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(29, 185, 84, 0.3);
    border-radius: var(--border-radius);
  }
`;

const SnackBar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  background-color: #323232;
  border-radius: var(--border-radius);
  text-align: center;
  z-index: 1000;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  box-shadow: var(--elevation-3);
  min-width: 300px;
  max-width: 90%;
  
  @media (max-width: 768px) {
    width: 90%;
    flex-direction: column;
    padding: calc(var(--spacing-unit));
    gap: calc(var(--spacing-unit));
  }
  
  button {
    background-color: transparent;
    border: none;
    border-radius: var(--border-radius);
    padding: calc(var(--spacing-unit)) calc(var(--spacing-unit) * 1.5);
    cursor: pointer;
    color: var(--primary-light);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    font-size: 14px;
    
    &:hover {
      background-color: rgba(29, 185, 84, 0.2);
    }
  }
`;

// Define a proper Board type for our internal state
interface BoardState {
  columns: {
    [key: string]: ColumnType;
  };
  columnOrder: string[];
}

const initialData: BoardState = {
  columns: {
    "column-1": {
      id: "column-1",
      title: "What went well",
      cards: []
    },
    "column-2": {
      id: "column-2",
      title: "What can be improved",
      cards: []
    },
    "column-3": {
      id: "column-3",
      title: "Action Items",
      cards: []
    }
  },
  columnOrder: ["column-1", "column-2", "column-3"]
};

const initialCards: Record<string, Card> = {};

// Export the board types for ref
export interface BoardHandle {
  getBoardData: () => {
    columns: Record<string, ColumnType>;
    columnOrder: string[];
    cards: Record<string, Card>;
  };
}

interface BoardProps {
  boardId?: string;
}

const Board = forwardRef<BoardHandle, BoardProps>((props, ref) => {
  // Get boardId from props or route params
  const params = useParams<{ boardId: string }>();
  const boardId = props.boardId || params.boardId;
  
  const [board, setBoard] = useState<BoardState>(initialData);
  const [cards, setCards] = useState<Record<string, Card>>(initialCards);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [mergingMode, setMergingMode] = useState<boolean>(false);
  const [cardToMerge, setCardToMerge] = useState<{columnId: string, cardId: string} | null>(null);

  console.log("Board rendering with boardId:", boardId);

  // Effect to load board data from storage if exists
  useEffect(() => {
    if (!boardId) {
      console.error("No boardId provided");
      return;
    }
    
    // Try to load board data from localStorage
    const savedBoardData = localStorage.getItem(`board-${boardId}`);
    const savedCardsData = localStorage.getItem(`cards-${boardId}`);
    
    if (savedBoardData && savedCardsData) {
      try {
        const parsedBoard = JSON.parse(savedBoardData);
        const parsedCards = JSON.parse(savedCardsData);
        
        // Make sure board has required structure
        if (parsedBoard.columns && parsedBoard.columnOrder) {
          setBoard(parsedBoard);
          setCards(parsedCards);
          console.log(`Loaded board data for id: ${boardId}`, parsedBoard);
        } else {
          console.warn("Saved board data has incorrect structure, using default", parsedBoard);
          setBoard(initialData);
          setCards(initialCards);
          localStorage.setItem(`board-${boardId}`, JSON.stringify(initialData));
          localStorage.setItem(`cards-${boardId}`, JSON.stringify(initialCards));
        }
      } catch (error) {
        console.error('Error loading board data:', error);
        setBoard(initialData);
        setCards(initialCards);
        localStorage.setItem(`board-${boardId}`, JSON.stringify(initialData));
        localStorage.setItem(`cards-${boardId}`, JSON.stringify(initialCards));
      }
    } else {
      console.log(`No saved data found for board id: ${boardId}, using default data`);
      // Ensure the initial state is saved to localStorage
      localStorage.setItem(`board-${boardId}`, JSON.stringify(initialData));
      localStorage.setItem(`cards-${boardId}`, JSON.stringify(initialCards));
    }
  }, [boardId]);

  // Save board data whenever it changes
  useEffect(() => {
    if (boardId) {
      // Save to localStorage
      localStorage.setItem(`board-${boardId}`, JSON.stringify(board));
      localStorage.setItem(`cards-${boardId}`, JSON.stringify(cards));
    }
  }, [board, cards, boardId]);

  // Expose the board data via ref
  useImperativeHandle(ref, () => ({
    getBoardData: () => {
      return {
        columns: board.columns,
        columnOrder: board.columnOrder,
        cards
      };
    }
  }));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Get source and destination columns
    const startColumn = board.columns[source.droppableId];
    const endColumn = board.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === endColumn) {
      const newCardIds = Array.from(startColumn.cards);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        cards: newCardIds
      };

      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [newColumn.id]: newColumn
        }
      });
      return;
    }

    // Moving to a different column
    const startCardIds = Array.from(startColumn.cards);
    startCardIds.splice(source.index, 1);
    
    const newStartColumn = {
      ...startColumn,
      cards: startCardIds
    };

    const endCardIds = Array.from(endColumn.cards);
    endCardIds.splice(destination.index, 0, draggableId);
    
    const newEndColumn = {
      ...endColumn,
      cards: endCardIds
    };

    setBoard({
      ...board,
      columns: {
        ...board.columns,
        [newStartColumn.id]: newStartColumn,
        [newEndColumn.id]: newEndColumn
      }
    });
  };

  const handleVote = (columnId: string, cardId: string, increment: boolean) => {
    const card = cards[cardId];
    if (!card) return;
    
    const updatedCard = {
      ...card,
      votes: increment ? card.votes + 1 : Math.max(0, card.votes - 1)
    };

    setCards({
      ...cards,
      [cardId]: updatedCard
    });
  };

  const openCardModal = (columnId: string, cardId?: string) => {
    setActiveColumnId(columnId);
    
    if (cardId && cards[cardId]) {
      setActiveCard(cards[cardId]);
    } else {
      setActiveCard(null);
    }
    
    setIsModalOpen(true);
  };

  const handleSaveCard = (content: string) => {
    if (!content.trim()) {
      setIsModalOpen(false);
      setActiveCard(null);
      setActiveColumnId(null);
      return;
    }
    
    if (activeCard) {
      // Update existing card
      const updatedCard = {
        ...activeCard,
        content
      };
      
      setCards({
        ...cards,
        [activeCard.id]: updatedCard
      });
    } else if (activeColumnId) {
      // Create new card
      const newCardId = `card-${nanoid()}`;
      const newCard = {
        id: newCardId,
        content,
        votes: 0
      };
      
      // Add to cards state
      setCards({
        ...cards,
        [newCardId]: newCard
      });
      
      // Add to board column
      const column = board.columns[activeColumnId];
      const updatedColumn = {
        ...column,
        cards: [...column.cards, newCardId]
      };
      
      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [activeColumnId]: updatedColumn
        }
      });
    }
    
    setIsModalOpen(false);
    setActiveCard(null);
    setActiveColumnId(null);
  };

  const handleDeleteCard = () => {
    if (activeCard && activeColumnId) {
      // Remove from cards state
      const newCards = { ...cards };
      delete newCards[activeCard.id];
      setCards(newCards);
      
      // Remove from board column
      const column = board.columns[activeColumnId];
      const updatedColumn = {
        ...column,
        cards: column.cards.filter(id => id !== activeCard.id)
      };
      
      setBoard({
        ...board,
        columns: {
          ...board.columns,
          [activeColumnId]: updatedColumn
        }
      });
    }
    
    setIsModalOpen(false);
    setActiveCard(null);
    setActiveColumnId(null);
  };

  const startMerging = (columnId: string, cardId: string) => {
    setCardToMerge({ columnId, cardId });
    setMergingMode(true);
    setIsModalOpen(false);
  };

  const mergeCards = (targetColumnId: string, targetCardId: string) => {
    if (!cardToMerge) return;
    
    // Only merge if cards are different
    if (cardToMerge.cardId === targetCardId) {
      setMergingMode(false);
      setCardToMerge(null);
      return;
    }
    
    // Get content from both cards
    const sourceCard = cards[cardToMerge.cardId];
    const targetCard = cards[targetCardId];
    
    if (!sourceCard || !targetCard) {
      setMergingMode(false);
      setCardToMerge(null);
      return;
    }
    
    // Create merged content
    const mergedContent = `${targetCard.content}\n---\n${sourceCard.content}`;
    
    // Update target card with merged content and combined votes
    const updatedTargetCard = {
      ...targetCard,
      content: mergedContent,
      votes: targetCard.votes + sourceCard.votes
    };
    
    // Update cards state
    const newCards = { ...cards };
    newCards[targetCardId] = updatedTargetCard;
    delete newCards[cardToMerge.cardId];
    
    // Remove source card from its column
    const sourceColumn = board.columns[cardToMerge.columnId];
    const updatedSourceColumn = {
      ...sourceColumn,
      cards: sourceColumn.cards.filter(id => id !== cardToMerge.cardId)
    };
    
    // Update board
    setBoard({
      ...board,
      columns: {
        ...board.columns,
        [cardToMerge.columnId]: updatedSourceColumn
      }
    });
    
    setCards(newCards);
    setMergingMode(false);
    setCardToMerge(null);
  };

  console.log("Board state:", board);
  console.log("Cards state:", cards);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Container>
          {board.columnOrder.map((columnId) => {
            const column = board.columns[columnId];
            if (!column) {
              console.error(`Column ${columnId} not found`);
              return null;
            }
            
            return (
              <Column
                key={column.id}
                column={column}
                cards={cards}
                handleVote={handleVote}
                openCardModal={mergingMode ? 
                  (columnId, cardId) => cardId && mergeCards(columnId, cardId) : 
                  openCardModal}
              />
            );
          })}
        </Container>
      </DragDropContext>
      
      {isModalOpen && (
        <CardModal
          card={activeCard}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onClose={() => {
            setIsModalOpen(false);
            setActiveCard(null);
            setActiveColumnId(null);
          }}
          onStartMerging={activeCard ? 
            () => startMerging(activeColumnId!, activeCard.id) : 
            undefined}
        />
      )}
      
      {mergingMode && cardToMerge && (
        <SnackBar>
          <span>Select another card to merge with</span>
          <button onClick={() => {
            setMergingMode(false);
            setCardToMerge(null);
          }}>
            Cancel
          </button>
        </SnackBar>
      )}
    </>
  );
});

export default Board;
