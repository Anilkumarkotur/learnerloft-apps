import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Card } from "../types";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  width: 500px;
  max-width: 90%;
  padding: calc(var(--spacing-unit) * 3);
  box-shadow: var(--elevation-4);
  border-top: 3px solid var(--primary-color);
  
  h2 {
    color: var(--text-primary);
    margin-bottom: calc(var(--spacing-unit) * 2);
    font-weight: 500;
    font-size: 20px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  margin: calc(var(--spacing-unit) * 2) 0;
  padding: calc(var(--spacing-unit) * 1.5);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  resize: vertical;
  font-family: inherit;
  font-size: 16px;
  color: var(--text-primary);
  background-color: var(--surface-color);
  transition: border-color var(--transition-speed);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  
  .left {
    display: flex;
    gap: calc(var(--spacing-unit));
  }
  
  .right {
    display: flex;
    gap: calc(var(--spacing-unit));
  }
`;

interface ButtonProps {
  $contained?: boolean;
  $danger?: boolean;
}

const Button = styled.button<ButtonProps>`
  padding: calc(var(--spacing-unit)) calc(var(--spacing-unit) * 2);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  min-width: 64px;
  transition: all var(--transition-speed);
  
  background-color: ${props => 
    props.$contained ? 'var(--primary-color)' : 
    'transparent'};
  
  color: ${props => 
    props.$contained ? 'var(--text-on-primary)' : 
    props.$danger ? 'var(--error-color)' : 
    'var(--primary-color)'};
  
  &:hover {
    background-color: ${props => 
      props.$contained ? 'var(--primary-dark)' : 
      props.$danger ? 'rgba(244, 67, 54, 0.08)' : 
      'rgba(29, 185, 84, 0.08)'};
  }
`;

interface CardModalProps {
  card: Card | null;
  onSave: (content: string) => void;
  onDelete: () => void;
  onClose: () => void;
  onStartMerging?: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ 
  card, 
  onSave, 
  onDelete, 
  onClose,
  onStartMerging
}) => {
  const [content, setContent] = useState("");
  
  useEffect(() => {
    if (card) {
      setContent(card.content);
    } else {
      setContent("");
    }
  }, [card]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content.trim());
    }
  };
  
  return (
    <ModalOverlay onClick={onClose} data-testid="card-modal">
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2>{card ? "Edit Card" : "Add Card"}</h2>
        <form onSubmit={handleSubmit}>
          <TextArea data-testid="card-content" 
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Enter card content..."
            autoFocus
          />
          <ButtonGroup>
            <div className="left">
              {card && (
                <>
                  <Button type="button" $danger={true} onClick={onDelete} data-testid="delete-card">
                    Delete
                  </Button>
                  {onStartMerging && (
                    <Button type="button" onClick={onStartMerging} data-testid="start-merging">
                      Merge
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="right">
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" $contained={true} data-testid="save-card">
                {card ? "Save" : "Add"}
              </Button>
            </div>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CardModal;
