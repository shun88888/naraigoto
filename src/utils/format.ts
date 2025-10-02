export function formatJPY(amount: number) {
  try {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  } catch {
    return `¥${amount}`;
  }
}

export function formatDateISO(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function nextNDays(n = 14) {
  const days: string[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(formatDateISO(d));
  }
  return days;
}





