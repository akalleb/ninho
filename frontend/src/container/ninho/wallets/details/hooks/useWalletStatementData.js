import { useMemo } from 'react';
import dayjs from 'dayjs';

export default function useWalletStatementData({ transactions }) {
  const statementTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type === 'credit') return true;
      if (t.type !== 'debit') return true;
      const status = t.status;
      const isHiddenAttendance = !!t.attendance_id && t.is_auto_generated === true;
      if (isHiddenAttendance) return false;
      return status === 'pago' || status === 'agendado';
    });
  }, [transactions]);

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const grouped = {};
    sorted.forEach((t) => {
      const date = dayjs(t.date).format('DD/MM');
      if (!grouped[date]) grouped[date] = { income: 0, expense: 0 };
      if (t.type === 'credit' && (t.status === 'recebido' || t.status === 'conciliado')) {
        grouped[date].income += t.amount;
      } else if (t.type === 'debit' && t.status === 'pago') {
        grouped[date].expense += t.amount;
      }
    });
    const labels = Object.keys(grouped);
    const incomeData = labels.map((l) => grouped[l].income);
    const expenseData = labels.map((l) => grouped[l].expense);
    return {
      labels,
      datasets: [
        {
          label: 'Entradas',
          data: incomeData,
          borderColor: '#3f8600',
          backgroundColor: 'rgba(63, 134, 0, 0.2)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Saídas',
          data: expenseData,
          borderColor: '#cf1322',
          backgroundColor: 'rgba(207, 19, 34, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [transactions]);

  return { statementTransactions, chartData };
}
