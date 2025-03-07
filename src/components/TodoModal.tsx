import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Reusing styled components from the app
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--surface-color);
  padding: calc(var(--spacing-unit) * 4);
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--elevation-4);
  
  @media (max-width: 768px) {
    width: 95%;
    padding: calc(var(--spacing-unit) * 2);
  }
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: calc(var(--spacing-unit) * 3);
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  background: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'var(--text-on-primary)' : 'var(--primary-color)'};
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed);
  
  &:hover {
    background: ${props => props.primary ? 'var(--primary-dark)' : 'rgba(29, 185, 84, 0.1)'};
  }
`;

interface TodoModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const TodoModal: React.FC<TodoModalProps> = ({ onClose, onSubmit }) => {
  const navigate = useNavigate();

  const handleGoToTodoList = () => {
    // Close the modal
    onClose();
    // Navigate to the todo list page
    navigate('/todo-list');
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>Todo List</ModalTitle>
        <p>Would you like to go to the Todo list?</p>
        <ButtonGroup>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button primary onClick={handleGoToTodoList} data-testid="go-to-todo-list">
            Go to TODO list
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default TodoModal; 