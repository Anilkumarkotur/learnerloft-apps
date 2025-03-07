import React from 'react';
import styled from 'styled-components';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { Card as CardType } from '../types';
import Card from './Card';
import { StrictModeDroppable } from './Board';

const Container = styled.div`
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  width: 300px;
  margin: 0 calc(var(--spacing-unit));
  box-shadow: var(--elevation-1);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  flex: 1;
  min-width: 300px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-width: 100%;
    margin: 0 0 calc(var(--spacing-unit) * 2) 0;
  }
`;

const Title = styled.h3`
  padding: calc(var(--spacing-unit) * 2);
  font-weight: 500;
  font-size: 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--surface-color);
  margin: 0;
`;

const CardList = styled.div<{ isDraggingOver: boolean }>`
  padding: calc(var(--spacing-unit) * 2);
  flex-grow: 1;
  min-height: 100px;
  overflow-y: auto;
  transition: background-color 0.2s ease;
  background-color: ${props => props.isDraggingOver ? 'rgba(29, 185, 84, 0.05)' : 'transparent'};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: var(--border-radius);
  }
`;

const CardItem = styled.div<{ isDragging: boolean }>`
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 2);
  margin-bottom: calc(var(--spacing-unit) * 1.5);
  box-shadow: ${props => props.isDragging ? 'var(--elevation-3)' : 'var(--elevation-1)'};
  cursor: pointer;
  transition: box-shadow var(--transition-speed);
  
  &:hover {
    box-shadow: var(--elevation-2);
  }
`;

const CardContent = styled.div`
  margin-bottom: calc(var(--spacing-unit) * 1.5);
  word-break: break-word;
  color: var(--text-primary);
  white-space: pre-line;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: calc(var(--spacing-unit));
  padding-top: calc(var(--spacing-unit));
  border-top: 1px solid var(--border-color);
`;

const Votes = styled.div`
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit));
  font-weight: 500;
  color: var(--text-secondary);
`;

const VoteButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  color: var(--text-secondary);
  transition: background-color var(--transition-speed);
  font-size: 18px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const AddButton = styled.button`
  margin: calc(var(--spacing-unit)) calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 2);
  padding: calc(var(--spacing-unit) * 1.5);
  background-color: var(--surface-color);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-align: left;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  transition: background-color var(--transition-speed);
  box-shadow: var(--elevation-1);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &::before {
    content: "+";
    margin-right: 8px;
    font-size: 18px;
  }
`;

interface ColumnProps {
  column: {
    id: string;
    title: string;
    cards: string[];
  };
  cards: { [key: string]: CardType };
  handleVote: (columnId: string, cardId: string, increment: boolean) => void;
  openCardModal: (columnId: string, cardId?: string) => void;
}

const Column: React.FC<ColumnProps> = ({ column, cards, handleVote, openCardModal }) => {
  return (
    <Container>
      <Title>{column.title}</Title>
      <StrictModeDroppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <CardList
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {column.cards.map((cardId, index) => {
              const card = cards[cardId];
              
              // Skip if card doesn't exist
              if (!card) {
                console.warn(`Card with ID ${cardId} not found`);
                return null;
              }
              
              return (
                <Card
                  key={cardId}
                  card={card}
                  index={index}
                  columnId={column.id}
                  handleVote={handleVote}
                  openCardModal={openCardModal}
                />
              );
            })}
            {provided.placeholder}
          </CardList>
        )}
      </StrictModeDroppable>
      <AddButton onClick={() => openCardModal(column.id)}>
        Add Card
      </AddButton>
    </Container>
  );
};

export default Column;
