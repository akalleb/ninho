import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../../../../config/api/axios';
import normalizeApiError from '../../../../../utils/errors/normalizeApiError';

export default function useWalletPayroll({
  walletId,
  walletData,
  setWalletData,
  transactions,
  notification,
  refreshDashboard,
}) {
  const [payrollMonth, setPayrollMonth] = useState(dayjs());
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [attendanceById, setAttendanceById] = useState({});
  const [professionals, setProfessionals] = useState([]);
  const [fixedStaffRules, setFixedStaffRules] = useState({});
  const [savingFixedStaff, setSavingFixedStaff] = useState(false);
  const [generatingFixedPayment, setGeneratingFixedPayment] = useState(false);
  const [exportingPendingPdf, setExportingPendingPdf] = useState(false);

  useEffect(() => {
    api
      .get('/professionals/', { params: { limit: 1000 } })
      .then((res) => setProfessionals(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        api
          .get('/professionals/basic')
          .then((res) => setProfessionals(Array.isArray(res.data) ? res.data : []))
          .catch(() => setProfessionals([])),
      )
      .catch(() => setProfessionals([]));
  }, []);

  useEffect(() => {
    const raw = walletData?.payroll_fixed_staff;
    if (raw && typeof raw === 'object') {
      setFixedStaffRules(raw);
    } else {
      setFixedStaffRules({});
    }
  }, [walletData?.payroll_fixed_staff]);

  const roleLabel = (role) => {
    if (role === 'admin') return 'Gestor';
    if (role === 'operational') return 'Operacional';
    if (role === 'health') return 'Saúde';
    return role || '—';
  };

  const fixedStaff = useMemo(() => {
    return professionals.filter(
      (p) => p && (p.status || 'active') === 'active' && (p.role === 'admin' || p.role === 'operational'),
    );
  }, [professionals]);

  const monthKey = useMemo(() => payrollMonth.format('YYYY-MM'), [payrollMonth]);

  const fixedPaymentByDocRef = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      if (t.type !== 'debit') return;
      if (!t.document_ref) return;
      map.set(String(t.document_ref), t);
    });
    return map;
  }, [transactions]);

  const buildWalletUpdatePayload = (extra) => {
    return {
      name: walletData?.name,
      description: walletData?.description || null,
      is_restricted: !!walletData?.is_restricted,
      category: walletData?.category,
      bank_name: walletData?.bank_name || null,
      agency: walletData?.agency || null,
      account_number: walletData?.account_number || null,
      pix_key: walletData?.pix_key || null,
      auto_charge_enabled: !!walletData?.auto_charge_enabled,
      auto_charge_mode: walletData?.auto_charge_mode || null,
      auto_charge_flat_amount: walletData?.auto_charge_flat_amount ?? null,
      auto_charge_service_type_rates: walletData?.auto_charge_service_type_rates ?? null,
      auto_charge_professional_rates: walletData?.auto_charge_professional_rates ?? null,
      auto_charge_expense_destination: walletData?.auto_charge_expense_destination || null,
      auto_charge_expense_description: walletData?.auto_charge_expense_description || null,
      auto_charge_expense_category_id: walletData?.auto_charge_expense_category_id ?? null,
      payroll_fixed_staff: walletData?.payroll_fixed_staff ?? null,
      ...extra,
    };
  };

  const saveFixedStaffRules = async () => {
    try {
      setSavingFixedStaff(true);
      const payload = buildWalletUpdatePayload({ payroll_fixed_staff: fixedStaffRules });
      const { data } = await api.put(`/wallets/${walletId}`, payload);
      setWalletData(data);
      notification.success({ message: 'Regras da equipe fixa salvas' });
    } catch (error) {
      notification.error({
        message: 'Erro ao salvar regras',
        description: normalizeApiError(error, 'Falha ao salvar regras'),
      });
    } finally {
      setSavingFixedStaff(false);
    }
  };

  const ensureFixedRule = (professionalId) => {
    const key = String(professionalId);
    const existing = fixedStaffRules?.[key];
    if (existing && typeof existing === 'object') return existing;
    return { amount: 0, recurring: true };
  };

  const updateFixedRule = (professionalId, patch) => {
    const key = String(professionalId);
    const next = { ...ensureFixedRule(professionalId), ...patch };
    setFixedStaffRules((prev) => ({ ...(prev || {}), [key]: next }));
  };

  const createFixedPaymentForMonth = async (professional) => {
    const rule = ensureFixedRule(professional.id);
    const amount = Number(rule.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      notification.error({ message: 'Defina um valor válido antes de gerar o pagamento' });
      return;
    }
    const docRef = `payroll:${professional.id}:${monthKey}`;
    if (fixedPaymentByDocRef.has(docRef)) {
      notification.info({ message: 'Pagamento deste mês já foi gerado' });
      return;
    }
    try {
      setGeneratingFixedPayment(true);
      await api.post('/expenses', {
        wallet_id: Number(walletId),
        destination: professional.name,
        amount,
        status: 'pendente',
        paid_at: payrollMonth.endOf('month').format('YYYY-MM-DD'),
        document_ref: docRef,
        description: `Folha de pagamento (${monthKey}) - ${roleLabel(professional.role)}`,
      });
      notification.success({ message: 'Pagamento criado como pendente' });
      refreshDashboard(true);
    } catch (error) {
      notification.error({
        message: 'Erro ao gerar pagamento',
        description: normalizeApiError(error, 'Falha ao gerar pagamento'),
      });
    } finally {
      setGeneratingFixedPayment(false);
    }
  };

  const payExpense = async (expenseId) => {
    await api.post(`/expenses/${expenseId}/pay`, { paid_at: dayjs().format('YYYY-MM-DD') });
  };

  const payAttendancePayrollBulk = async ({ expenseIds, monthKey: monthKeyValue }) => {
    await api.post('/expenses/payroll/attendance/bulk', {
      expense_ids: expenseIds,
      month_key: monthKeyValue,
      paid_at: dayjs().format('YYYY-MM-DD'),
    });
  };

  const handlePayAttendanceMany = async (expenseIds) => {
    try {
      setPayrollLoading(true);
      await payAttendancePayrollBulk({ expenseIds, monthKey });
      notification.success({ message: 'Pagamento registrado com sucesso' });
      refreshDashboard(true);
    } catch (error) {
      notification.error({
        message: 'Erro ao registrar pagamento',
        description: normalizeApiError(error, 'Falha ao registrar pagamento'),
      });
    } finally {
      setPayrollLoading(false);
    }
  };

  const handleConfirmFixedStaffPayment = async (expenseId) => {
    try {
      setGeneratingFixedPayment(true);
      await payExpense(expenseId);
      notification.success({ message: 'Pagamento confirmado com sucesso' });
      refreshDashboard(true);
    } catch (error) {
      notification.error({
        message: 'Erro ao confirmar pagamento',
        description: normalizeApiError(error, 'Falha ao confirmar pagamento'),
      });
    } finally {
      setGeneratingFixedPayment(false);
    }
  };

  const pendingPayrollExpenses = useMemo(() => {
    const start = payrollMonth.startOf('month');
    const end = payrollMonth.endOf('month');
    return transactions
      .filter((t) => t.type === 'debit' && t.status === 'pendente' && t.attendance_id)
      .filter((t) => {
        const createdAt = t.created_at ? dayjs(t.created_at) : dayjs(t.date);
        return (
          createdAt.isValid() &&
          (createdAt.isSame(start) || createdAt.isAfter(start)) &&
          (createdAt.isSame(end) || createdAt.isBefore(end))
        );
      });
  }, [transactions, payrollMonth]);

  useEffect(() => {
    const run = async () => {
      if (!pendingPayrollExpenses.length) {
        setAttendanceById({});
        return;
      }
      setPayrollLoading(true);
      try {
        const uniqueIds = Array.from(new Set(pendingPayrollExpenses.map((e) => e.attendance_id).filter(Boolean)));
        const results = await Promise.allSettled(uniqueIds.map((id) => api.get(`/attendances/${id}`)));
        const nextMap = {};
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            nextMap[String(uniqueIds[idx])] = r.value.data;
          }
        });
        setAttendanceById(nextMap);
      } finally {
        setPayrollLoading(false);
      }
    };
    run();
  }, [pendingPayrollExpenses]);

  const payrollRows = useMemo(() => {
    const map = new Map();
    pendingPayrollExpenses.forEach((expense) => {
      const attendance = attendanceById[String(expense.attendance_id)];
      const professional = attendance?.professional;
      const professionalId = professional?.id ?? -1;
      const professionalName = professional?.name || 'Sem profissional';
      const key = String(professionalId);
      if (!map.has(key)) {
        map.set(key, {
          key,
          professional_id: professionalId,
          professional_name: professionalName,
          count: 0,
          total_amount: 0,
          expenses: [],
        });
      }
      const group = map.get(key);
      group.count += 1;
      group.total_amount += expense.amount || 0;
      group.expenses.push({ expense, attendance });
    });
    return Array.from(map.values()).sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
  }, [pendingPayrollExpenses, attendanceById]);

  const fixedStaffRows = useMemo(() => {
    return fixedStaff.map((p) => {
      const docRef = `payroll:${p.id}:${monthKey}`;
      const payment = fixedPaymentByDocRef.get(docRef);
      const rule = ensureFixedRule(p.id);
      return {
        key: String(p.id),
        professional: p,
        docRef,
        payment,
        rule,
      };
    });
  }, [fixedStaff, monthKey, fixedPaymentByDocRef, fixedStaffRules]);

  const pendingFixedStaffForPdf = useMemo(() => {
    return fixedStaffRows.filter((row) => row.payment && row.payment.status === 'pendente');
  }, [fixedStaffRows]);

  const formatBankData = (professional) => {
    const raw = professional?.bank_data;
    if (!raw || typeof raw !== 'string') return 'Não informado';
    return raw.replace(/\s+/g, ' ').trim();
  };

  const handleExportPendingFixedPaymentsPDF = async () => {
    if (!pendingFixedStaffForPdf.length) {
      notification.info({ message: 'Não há pendências para exportar neste mês' });
      return;
    }
    try {
      setExportingPendingPdf(true);
      const pdfModule = await import('jspdf');
      const jsPDF = pdfModule?.default || pdfModule?.jsPDF || pdfModule;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginLeft = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 46;

      doc.setFontSize(15);
      doc.text('Relação de Colaboradores Pendentes', marginLeft, y);
      y += 20;
      doc.setFontSize(10);
      doc.text(`Carteira: ${walletData?.name || '-'}`, marginLeft, y);
      y += 14;
      doc.text(`Mês de referência: ${monthKey}`, marginLeft, y);
      y += 18;
      doc.setFontSize(11);
      doc.text('Nome', marginLeft, y);
      doc.text('Conta bancária', marginLeft + 180, y);
      doc.text('Valor a pagar', pageWidth - 160, y);
      y += 8;
      doc.line(marginLeft, y, pageWidth - marginLeft, y);
      y += 16;

      let total = 0;
      pendingFixedStaffForPdf.forEach((row) => {
        const amount = Number(row.payment?.amount || row.rule?.amount || 0);
        total += amount;
        const name = row.professional?.name || 'Sem nome';
        const bankData = formatBankData(row.professional);
        const amountText = `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        const bankLines = doc.splitTextToSize(bankData, 260);
        const lines = Math.max(1, bankLines.length);
        const rowHeight = lines * 14;

        if (y + rowHeight + 24 > pageHeight - 50) {
          doc.addPage();
          y = 46;
        }
        doc.text(name, marginLeft, y);
        doc.text(bankLines, marginLeft + 180, y);
        doc.text(amountText, pageWidth - 160, y);
        y += rowHeight + 6;
      });

      y += 6;
      doc.line(marginLeft, y, pageWidth - marginLeft, y);
      y += 16;
      doc.setFontSize(12);
      doc.text(`Total pendente: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, marginLeft, y);
      doc.save(`pendentes_carteira_${walletId}_${monthKey}.pdf`);
      notification.success({ message: 'PDF de pendentes exportado com sucesso' });
    } catch (error) {
      notification.error({
        message: 'Erro ao exportar PDF',
        description: normalizeApiError(error, 'Falha ao gerar o documento PDF'),
      });
    } finally {
      setExportingPendingPdf(false);
    }
  };

  return {
    payrollMonth,
    setPayrollMonth,
    payrollLoading,
    savingFixedStaff,
    generatingFixedPayment,
    exportingPendingPdf,
    monthKey,
    payrollRows,
    fixedStaffRows,
    roleLabel,
    updateFixedRule,
    saveFixedStaffRules,
    createFixedPaymentForMonth,
    handlePayAttendanceMany,
    handleConfirmFixedStaffPayment,
    handleExportPendingFixedPaymentsPDF,
  };
}
