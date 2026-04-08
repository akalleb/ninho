import { useCallback, useEffect, useState } from 'react';
import api from '../../../../../config/api/axios';
import normalizeApiError from '../../../../../utils/errors/normalizeApiError';

export default function useWalletDashboard({ walletId, notification }) {
  const [walletData, setWalletData] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(async (silent = false) => {
    if (!walletId || walletId === 'add') {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const [dashboardResult, walletsResult, revenuesResult, expensesResult] = await Promise.allSettled([
        api.get(`/wallets/${walletId}/dashboard`),
        api.get('/wallets/'),
        api.get('/revenues/', { params: { wallet_id: walletId } }),
        api.get('/expenses/', { params: { wallet_id: walletId } }),
      ]);

      if (dashboardResult.status !== 'fulfilled') {
        throw dashboardResult.reason;
      }

      const dashboardData = dashboardResult.value.data || {};
      setWalletData(dashboardData.wallet || null);
      setStats(dashboardData.stats || {});

      if (walletsResult.status === 'fulfilled') {
        const walletsData = Array.isArray(walletsResult.value.data) ? walletsResult.value.data : [];
        setWallets(walletsData.filter((w) => w.id !== parseInt(walletId, 10)));
      } else {
        setWallets([]);
      }

      const revenuesData =
        revenuesResult.status === 'fulfilled' && Array.isArray(revenuesResult.value.data)
          ? revenuesResult.value.data
          : [];
      const expensesData =
        expensesResult.status === 'fulfilled' && Array.isArray(expensesResult.value.data)
          ? expensesResult.value.data
          : [];

      if (revenuesResult.status !== 'fulfilled' || expensesResult.status !== 'fulfilled') {
        notification.warning({
          message: 'Dados incompletos no extrato',
          description: 'Não foi possível carregar todas as receitas/despesas da carteira neste momento.',
        });
      }

      const revenues = revenuesData.map((r) => ({ ...r, type: 'credit', date: r.received_at }));
      const expenses = expensesData.map((e) => ({ ...e, type: 'debit', date: e.paid_at || e.created_at }));
      const combined = [...revenues, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
      const transactionsWithKeys = combined.map((item, index) => ({
        ...item,
        uniqueKey: `${item.type}-${item.id}-${index}`,
      }));
      setTransactions(transactionsWithKeys);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar dados da carteira',
        description: normalizeApiError(error, 'Falha na consulta da carteira'),
      });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [walletId, notification]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    walletData,
    setWalletData,
    stats,
    transactions,
    wallets,
    loading,
    refreshDashboard,
  };
}
