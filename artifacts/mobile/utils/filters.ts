import { Operation, OperationType, TimeFilter } from '@/types';

export function filterByTime(operations: Operation[], filter: TimeFilter): Operation[] {
  const now = new Date();
  return operations.filter((op) => {
    const date = new Date(op.date);
    if (filter === 'today') {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }
    if (filter === 'month') {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }
    if (filter === 'year') {
      return date.getFullYear() === now.getFullYear();
    }
    if (filter === 'all') {
      return true;
    }
    return true;
  });
}

export function filterByType(operations: Operation[], type: OperationType): Operation[] {
  return operations.filter((op) => op.type === type);
}

export function computeTotals(operations: Operation[]) {
  let income = 0;
  let expense = 0;
  let debt = 0;
  let lent = 0;
  for (const op of operations) {
    if (op.type === 'income') income += op.amount;
    else if (op.type === 'expense') expense += op.amount;
    else if (op.type === 'debt') debt += op.amount;
    else if (op.type === 'lent') lent += op.amount;
  }
  return { income, expense, debt, lent, balance: income - expense + debt - lent };
}

export function groupByHour(operations: Operation[]): { label: string; value: number }[] {
  const hours: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hours[h] = 0;
  for (const op of operations) {
    const h = new Date(op.date).getHours();
    hours[h] += op.amount;
  }
  return Object.entries(hours)
    .filter((_, i) => i % 3 === 0)
    .map(([h, v]) => ({ label: `${h}:00`, value: v }));
}

export function groupByDay(operations: Operation[]): { label: string; value: number }[] {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days: Record<number, number> = {};
  for (let d = 1; d <= daysInMonth; d++) days[d] = 0;
  for (const op of operations) {
    const d = new Date(op.date).getDate();
    days[d] = (days[d] || 0) + op.amount;
  }
  return Object.entries(days)
    .filter((_, i) => i % 4 === 0 || i === daysInMonth - 1)
    .map(([d, v]) => ({ label: d, value: v }));
}

export function groupByMonth(operations: Operation[]): { label: string; value: number }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totals: Record<number, number> = {};
  for (let m = 0; m < 12; m++) totals[m] = 0;
  for (const op of operations) {
    const m = new Date(op.date).getMonth();
    totals[m] += op.amount;
  }
  return Object.entries(totals).map(([m, v]) => ({ label: months[Number(m)], value: v }));
}
