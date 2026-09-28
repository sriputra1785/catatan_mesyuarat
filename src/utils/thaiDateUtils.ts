export const MALAY_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

export const MALAY_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'
];

export const MALAY_DAYS = [
  'Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'
];

// Alias for compatibility
export const THAI_MONTHS = MALAY_MONTHS;
export const THAI_MONTHS_SHORT = MALAY_MONTHS_SHORT;
export const THAI_DAYS = MALAY_DAYS;

/**
 * Format date string (YYYY-MM-DD) to Malay formal date
 * e.g., '15 September 2026' or 'Hari Selasa, 15 September 2026'
 */
export const formatThaiDate = (dateStr: string, includeDayName = false): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = MALAY_MONTHS[month] || '';

  if (includeDayName) {
    const d = new Date(year, month, day);
    const dayName = MALAY_DAYS[d.getDay()];
    return `Hari ${dayName}, ${day} ${monthName} ${year}`;
  }

  return `${day} ${monthName} ${year}`;
};

export const formatThaiDateShort = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;

  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = MALAY_MONTHS_SHORT[month] || '';

  return `${day} ${monthName} ${year}`;
};

export const getMonthNameThai = (monthIndex: number, yearCe?: number): string => {
  const m = MALAY_MONTHS[monthIndex] || '';
  if (yearCe) {
    return `${m} ${yearCe}`;
  }
  return m;
};
