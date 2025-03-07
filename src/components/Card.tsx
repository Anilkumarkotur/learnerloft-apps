import React from "react";
import styled from "styled-components";
import { Draggable } from "react-beautiful-dnd";
import { Card as CardType } from "../types";

const Container = styled.div<{ $isDragging: boolean }>`
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 2);
  margin-bottom: calc(var(--spacing-unit) * 1.5);
  box-shadow: ${props => props.$isDragging ? 'var(--elevation-3)' : 'var(--elevation-1)'};
  transition: all var(--transition-speed);
  border-left: ${props => props.$isDragging ? '3px solid var(--primary-color)' : '1px solid var(--border-color)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--elevation-2);
  }
  
  .card-content {
    margin-bottom: calc(var(--spacing-unit) * 1.5);
    word-break: break-word;
    white-space: pre-line;
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.5;
  }
  
  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: calc(var(--spacing-unit));
    padding-top: calc(var(--spacing-unit));
    border-top: 1px solid var(--border-color);
  }
  
  .votes {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit));
    font-weight: 500;
    color: var(--text-secondary);
  }
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  color: var(--text-secondary);
  transition: all var(--transition-speed);
  font-size: 18px;
  
  &:hover {
    background-color: rgba(29, 185, 84, 0.1);
    color: var(--primary-color);
  }
`;

const ThumbsUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 20H4C5.1 20 6 19.1 6 18V10C6 8.9 5.1 8 4 8H2V20ZM22 9C22 7.9 21.1 7 20 7H13.7L14.7 2.4C14.8 2.1 14.8 1.9 14.7 1.7C14.5 1.3 14.2 1 13.9 0.8L12.5 0L6.8 6.6C6.3 7.1 6 7.8 6 8.5V16C6 17.7 7.3 19 9 19H17.5C18.4 19 19.1 18.5 19.5 17.7L21.9 11.2C22 11 22 10.5 22 10V9Z" fill="currentColor"/>
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 4H20C18.9 4 18 4.9 18 6V14C18 15.1 18.9 16 20 16H22V4ZM2 15C2 16.1 2.9 17 4 17H10.3L9.3 21.6C9.2 21.9 9.2 22.1 9.3 22.3C9.5 22.7 9.8 23 10.1 23.2L11.5 24L17.2 17.4C17.7 16.9 18 16.2 18 15.5V8C18 6.3 16.7 5 15 5H6.5C5.6 5 4.9 5.5 4.5 6.3L2.1 12.8C2 13 2 13.5 2 14V15Z" fill="currentColor"/>
  </svg>
);

const TextButton = styled.button`
  background-color: transparent;
  border: none;
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit)) calc(var(--spacing-unit) * 2);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  cursor: pointer;
  color: var(--primary-color);
  transition: all var(--transition-speed);
  
  &:hover {
    background-color: rgba(29, 185, 84, 0.08);
  }
`;

interface CardProps {
  card: CardType;
  index: number;
  columnId: string;
  handleVote: (columnId: string, cardId: string, increment: boolean) => void;
  openCardModal: (columnId: string, cardId?: string) => void;
}

const Card: React.FC<CardProps> = ({ card, index, columnId, handleVote, openCardModal }) => {
  if (!card || !card.id) {
    console.error("Card or card ID is undefined");
    return null;
  }

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          $isDragging={snapshot.isDragging}
          style={{ ...provided.draggableProps.style }}
          onClick={() => openCardModal(columnId, card.id)}
        >
          <div className="card-content">{card.content}</div>
          <div className="card-actions">
            <div className="votes">
              <IconButton onClick={(e) => {
                e.stopPropagation();
                handleVote(columnId, card.id, false);
              }}>
                <ThumbsDownIcon />
              </IconButton>
              <span>{card.votes}</span>
              <IconButton onClick={(e) => {
                e.stopPropagation();
                handleVote(columnId, card.id, true);
              }}>
                <ThumbsUpIcon />
              </IconButton>
            </div>
            <TextButton onClick={(e) => {
              e.stopPropagation();
              openCardModal(columnId, card.id);
            }}>
              Edit
            </TextButton>
          </div>
        </Container>
      )}
    </Draggable>
  );
};

export default Card;
