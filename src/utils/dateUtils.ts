export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XAF', 'FCFA');
};

export const getNextPaymentDate = (startDate: Date, frequency: string, customDays?: number, cycle: number = 1): Date => {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + cycle);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (cycle * 7));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + cycle);
      break;
    case 'custom':
      if (customDays) {
        date.setDate(date.getDate() + (cycle * customDays));
      }
      break;
  }
  
  return date;
};

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateUserCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const isPaymentOverdue = (dueDate: Date): boolean => {
  return new Date() > dueDate;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};