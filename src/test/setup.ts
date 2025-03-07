import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock nanoid to return a predictable ID
vi.mock('nanoid', () => ({
  nanoid: () => 'mocked-id'
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', () => ({
  Droppable: ({ children }) => 
    children({
      droppableProps: {
        'data-rbd-droppable-context-id': 'mock-context',
        'data-rbd-droppable-id': 'mock-id'
      },
      innerRef: () => {},
      placeholder: null
    }, { isDraggingOver: false }),

  Draggable: ({ children }) => 
    children({
      draggableProps: {
        'data-rbd-draggable-context-id': 'mock-context',
        'data-rbd-draggable-id': 'mock-id',
        style: {}
      },
      innerRef: () => {},
      dragHandleProps: {
        'data-rbd-drag-handle-draggable-id': 'mock-id',
        'data-rbd-drag-handle-context-id': 'mock-context'
      }
    }, { isDragging: false, isDropAnimating: false }),

  DragDropContext: ({ children }) => React.createElement('div', {}, children)
}));