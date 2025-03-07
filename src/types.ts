export interface Card {
  id: string;
  content: string;
  votes: number;
}

export interface Column {
  id: string;
  title: string;
  cards: string[];
}

export interface Board {
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
}
