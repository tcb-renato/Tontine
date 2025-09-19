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

export const getNextPaymentDate = (startDate: Date, frequency: string, customDays?: number, cycle: number = 1, paymentDay?: string): Date => {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + cycle);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (cycle * 7));
      if (paymentDay) {
        const targetDay = getDayNumber(paymentDay);
        const currentDay = date.getDay();
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        date.setDate(date.getDate() + daysToAdd);
      }
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + cycle);
      if (paymentDay) {
        const targetDay = getDayNumber(paymentDay);
        // Find the first occurrence of the target day in the month
        date.setDate(1);
        const firstDay = date.getDay();
        const daysToAdd = (targetDay - firstDay + 7) % 7;
        date.setDate(1 + daysToAdd);
      }
      break;
    case 'custom':
      if (customDays) {
        date.setDate(date.getDate() + (cycle * customDays));
      }
      break;
  }
  
  return date;
};

export const getDayNumber = (dayName: string): number => {
  const days = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };
  return days[dayName as keyof typeof days] || 1;
};

export const getDayName = (dayNumber: number): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayNumber] || 'Lundi';
};

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateInviteLink = (tontineId: string, inviteCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/join/${tontineId}?code=${inviteCode}`;
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

export const isInCollectWindow = (date: Date, collectWindow?: { startDay: number; endDay: number }): boolean => {
  if (!collectWindow) return true;
  
  const day = date.getDate();
  return day >= collectWindow.startDay && day <= collectWindow.endDay;
};

export const getCollectWindowText = (collectWindow?: { startDay: number; endDay: number }): string => {
  if (!collectWindow) return 'Tout le mois';
  return `Du ${collectWindow.startDay} au ${collectWindow.endDay} du mois`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const shareViaWhatsApp = (text: string, url?: string): void => {
  const message = url ? `${text}\n${url}` : text;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

export const shareViaSMS = (text: string, url?: string): void => {
  const message = url ? `${text}\n${url}` : text;
  const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
  window.open(smsUrl);
};

export const shareViaEmail = (subject: string, text: string, url?: string): void => {
  const body = url ? `${text}\n\n${url}` : text;
  const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(emailUrl);
};