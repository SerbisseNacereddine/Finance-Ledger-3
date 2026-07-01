export type OperationType = 'income' | 'expense' | 'debt' | 'lent';
export type TimeFilter = 'today' | 'month' | 'year' | 'all';

export interface Operation {
  id: string;
  title: string;
  amount: number;
  type: OperationType;
  note?: string;
  date: string;
}
