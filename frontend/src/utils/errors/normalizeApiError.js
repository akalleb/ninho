export default function normalizeApiError(error, fallback = 'Falha na operação') {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.msg) return item.msg;
        return null;
      })
      .filter(Boolean);
    if (messages.length) return messages.join(' | ');
  }
  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string') return detail.message;
    try {
      return JSON.stringify(detail);
    } catch {
      return fallback;
    }
  }
  if (typeof error?.message === 'string') return error.message;
  return fallback;
}
