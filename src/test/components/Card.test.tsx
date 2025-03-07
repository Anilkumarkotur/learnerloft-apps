import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import Card from '../../components/Card';
import { Card as CardType } from '../types';

describe('Card Component', () => {
  const mockCard: CardType = {
    id: 'card-1',
    content: 'Test card content',
    votes: 3
  };

  const mockHandleVote = vi.fn();
  const mockOpenCardModal = vi.fn();
  
  const renderCard = (card = mockCard) => {
    return render(
      <Card 
        card={card}
        index={0}
        columnId="column-1"
        handleVote={mockHandleVote}
        openCardModal={mockOpenCardModal}
      />
    );
  };

  it('renders card content correctly', () => {
    renderCard();
    expect(screen.getByText('Test card content')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows edit button', () => {
    renderCard();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('calls handleVote with correct params when thumbs up is clicked', () => {
    renderCard();
    const thumbsUp = screen.getAllByRole('button')[1]; // Third button (thumbs up)
    fireEvent.click(thumbsUp);
    
    expect(mockHandleVote).toHaveBeenCalledWith('column-1', 'card-1', true);
  });

  it('calls handleVote with correct params when thumbs down is clicked', () => {
    renderCard();
    const thumbsDown = screen.getAllByRole('button')[0]; // First button (thumbs down)
    fireEvent.click(thumbsDown);
    
    expect(mockHandleVote).toHaveBeenCalledWith('column-1', 'card-1', false);
  });

  it('calls openCardModal when edit button is clicked', () => {
    renderCard();
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(mockOpenCardModal).toHaveBeenCalledWith('column-1', 'card-1');
  });

  it('handles null card gracefully', () => {
    // Mock console.error to prevent it from polluting test output
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { container } = render(
      <Card 
        card={null as unknown as CardType}
        index={0}
        columnId="column-1"
        handleVote={mockHandleVote}
        openCardModal={mockOpenCardModal}
      />
    );
    
    expect(console.error).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('handles card with no id gracefully', () => {
    // Mock console.error to prevent it from polluting test output
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const invalidCard = { ...mockCard, id: undefined } as unknown as CardType;
    
    const { container } = render(
      <Card 
        card={invalidCard}
        index={0}
        columnId="column-1"
        handleVote={mockHandleVote}
        openCardModal={mockOpenCardModal}
      />
    );
    
    expect(console.error).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 