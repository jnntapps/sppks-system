
// Helper to format date from YYYY-MM-DD or ISO string to DD/MM/YYYY
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  
  // Safe split: handle ISO T or space if present to clean time part
  // Example: 2025-11-20T16:00:00.000Z -> 2025-11-20
  let cleanDate = dateStr;
  
  if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
          cleanDate = dateStr.split('T')[0];
      } else if (dateStr.includes(' ')) {
          cleanDate = dateStr.split(' ')[0];
      }
  }

  const parts = cleanDate.split('-');
  if (parts.length !== 3) return cleanDate; // Return original if not YYYY-MM-DD
  
  // Ensure we display DD/MM/YYYY
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Helper to determine movement status (Active, Upcoming, Past)
export const getMovementTimeStatus = (dateOut: string, dateReturn: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Clean dates before parsing
  const cleanOut = dateOut.split('T')[0];
  const cleanRet = dateReturn.split('T')[0];

  const dOut = new Date(cleanOut);
  dOut.setHours(0, 0, 0, 0);
  
  const dRet = new Date(cleanRet);
  dRet.setHours(0, 0, 0, 0);

  if (today > dRet) return { label: 'TAMAT', color: 'bg-slate-100 text-slate-500' };
  if (today < dOut) return { label: 'AKAN DATANG', color: 'bg-blue-100 text-blue-700' };
  return { label: 'SEDANG BERLANGSUNG', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
};
