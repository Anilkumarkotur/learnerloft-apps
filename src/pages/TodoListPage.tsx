import React, { useState } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: calc(var(--spacing-unit) * 3);
`;

const Header = styled.h1`
  color: var(--text-primary);
  margin-bottom: calc(var(--spacing-unit) * 2);
`;

const TodoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TodoItem = styled.li`
  display: flex;
  align-items: center;
  padding: calc(var(--spacing-unit));
  margin-bottom: calc(var(--spacing-unit));
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-1);
`;

const Checkbox = styled.input`
  margin-right: calc(var(--spacing-unit));
`;

const TodoText = styled.span<{ $completed: boolean }>`
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  color: ${props => props.$completed ? 'var(--text-secondary)' : 'var(--text-primary)'};
  flex: 1;
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: calc(var(--spacing-unit) * 2);
`;

const Input = styled.input`
  flex: 1;
  padding: calc(var(--spacing-unit));
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  font-size: 16px;
`;

const AddButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: calc(var(--spacing-unit)) calc(var(--spacing-unit) * 2);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoListPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };
  
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };
  
  return (
    <PageContainer>
      <Header>Todo List</Header>
      
      <InputGroup>
        <Input 
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          data-testid="new-todo-input"
        />
        <AddButton 
          onClick={handleAddTodo}
          data-testid="add-todo-button"
        >
          Add
        </AddButton>
      </InputGroup>
      
      <TodoList>
        {todos.map(todo => (
          <TodoItem key={todo.id}>
            <Checkbox 
              type="checkbox" 
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              data-testid={`todo-checkbox-${todo.id}`}
            />
            <TodoText $completed={todo.completed}>
              {todo.text}
            </TodoText>
          </TodoItem>
        ))}
      </TodoList>
    </PageContainer>
  );
};

export default TodoListPage; 