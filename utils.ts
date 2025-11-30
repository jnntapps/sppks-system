
// Helper to format date from YYYY-MM-DD or ISO string to DD/MM/YYYY
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  
  const clean = normalizeDate(dateStr);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// ULTRA ROBUST Date Normalizer (Fixed Timezone Issue)
export const normalizeDate = (dateStr: any): string => {
    if (dateStr === undefined || dateStr === null) return '';
    
    let s = String(dateStr).trim();
    // Buang invisible characters
    s = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 1. PENTING: Kesan format ISO UTC (yang ada huruf 'T' dan 'Z')
    // Ini WAJIB diletakkan paling atas supaya ia tidak dipotong oleh Regex di bawah
    // Contoh dari Google Sheet: "2025-11-29T16:00:00.000Z" (Sebenarnya 30hb Malaysia)
    if (s.includes('T') && (s.includes('Z') || s.includes('+'))) {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
            // Tukar kepada tarikh LOKAL (Browser pengguna - Waktu Malaysia)
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    }

    // 2. Format Malaysia/UK (DD/MM/YYYY atau DD-MM-YYYY)
    // Contoh: "30/11/2025"
    const myMatch = s.match(/^(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/);
    if (myMatch) {
        return `${myMatch[3]}-${myMatch[2].padStart(2,'0')}-${myMatch[1].padStart(2,'0')}`;
    }

    // 3. Format Standard (YYYY-MM-DD)
    // Contoh: "2025-11-30"
    const isoMatch = s.match(/^(\d{4})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{1,2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2,'0')}-${isoMatch[3].padStart(2,'0')}`;
    }

    // 4. Fallback terakhir
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    return s;
};

// Get today's date as YYYY-MM-DD string in LOCAL time
export const getTodayString = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to determine movement status
export const getMovementTimeStatus = (dateOut: string, dateReturn: string) => {
  const today = getTodayString();
  const end = normalizeDate(dateReturn);

  if (end < today) {
      return { label: 'SELESAI', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  }
  return { label: 'DALAM TUGAS', color: 'bg-red-100 text-red-700 border border-red-200' };
};
