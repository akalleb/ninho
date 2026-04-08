import { useState } from 'react';
import { Form } from 'antd';
import api from '../../../../../config/api/axios';
import normalizeApiError from '../../../../../utils/errors/normalizeApiError';

export default function useWalletFinancialActions({ walletId, notification, refreshDashboard }) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [form] = Form.useForm();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferForm] = Form.useForm();

  const handleExpenseSubmit = async (values) => {
    setExpenseLoading(true);
    try {
      const payload = {
        ...values,
        wallet_id: walletId,
        paid_at: values.paid_at.format('YYYY-MM-DD'),
        amount: parseFloat(values.amount),
      };
      await api.post('/expenses', payload);
      notification.success({ message: 'Saída registrada com sucesso!' });
      setIsExpenseModalOpen(false);
      form.resetFields();
      refreshDashboard(true);
    } catch (error) {
      notification.error({
        message: 'Erro ao registrar saída',
        description: normalizeApiError(error, 'Falha ao registrar saída'),
      });
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleTransferSubmit = async (values) => {
    setTransferLoading(true);
    try {
      const payload = {
        source_wallet_id: parseInt(walletId, 10),
        target_wallet_id: values.target_wallet_id,
        amount: parseFloat(values.amount),
        transfer_date: values.transfer_date.format('YYYY-MM-DD'),
        description: values.description,
      };
      await api.post('/wallets/transfer', payload);
      notification.success({ message: 'Transferência realizada com sucesso!' });
      setIsTransferModalOpen(false);
      transferForm.resetFields();
      refreshDashboard(true);
    } catch (error) {
      notification.error({
        message: 'Erro na transferência',
        description: normalizeApiError(error, 'Falha na transferência'),
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleUpdateWallet = async (values) => {
    try {
      await api.put(`/wallets/${walletId}`, values);
      notification.success({ message: 'Carteira atualizada com sucesso' });
      refreshDashboard();
    } catch (error) {
      notification.error({
        message: 'Erro ao atualizar',
        description: normalizeApiError(error, 'Falha ao atualizar carteira'),
      });
    }
  };

  return {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    expenseLoading,
    form,
    isTransferModalOpen,
    setIsTransferModalOpen,
    transferLoading,
    transferForm,
    handleExpenseSubmit,
    handleTransferSubmit,
    handleUpdateWallet,
  };
}
