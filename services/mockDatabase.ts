
import { Staff, Movement, StaffStatus, UserRole } from '../types';

// PENTING: Gantikan URL di dalam tanda petik di bawah dengan Web App URL anda dari Google Apps Script (Fasa 1)
const API_URL = "https://script.google.com/macros/s/AKfycbzjr5i-bnfJ5VF1aWoylImk3ed4IKXDilD6uMcZHoFeYSHzKuEk1Tb55ulb6Egje_Z8lQ/exec";

// Helper for status calculation (client-side logic)
const calculateStatus = (movements: Movement[]): StaffStatus => {
  if (!movements || movements.length === 0) return StaffStatus.IN_OFFICE;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find if there is any movement that covers today
  const activeMovement = movements.find(m => {
    const dOut = new Date(m.dateOut);
    const dRet = new Date(m.dateReturn);
    dOut.setHours(0,0,0,0);
    dRet.setHours(0,0,0,0);
    return today >= dOut && today <= dRet;
  });

  return activeMovement ? StaffStatus.OUT_OF_OFFICE : StaffStatus.IN_OFFICE;
};

// Helper for sending requests to GAS to avoid CORS preflight issues
const sendPostRequest = async (action: string, payload: any) => {
    const response = await fetch(API_URL, {
        method: "POST",
        // PENTING: Gunakan text/plain untuk mengelakkan 'OPTIONS' preflight request yang sering gagal di GAS
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ action, payload })
    });
    return response;
};

export const db = {
  getStaff: async (): Promise<Staff[]> => {
    try {
        // Added timestamp to prevent browser caching
        const response = await fetch(`${API_URL}?action=getStaff&_t=${Date.now()}`);
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        
        // Robust mapping: Convert numbers/nulls to strings to avoid type mismatch during login
        const mappedStaff = data.map((s: any) => {
            // Parse rank safely: handle string "1", number 1, or missing/null
            let parsedRank = 99999; // Default to end of list
            if (s.rank !== undefined && s.rank !== null && s.rank !== '') {
                const r = Number(s.rank);
                if (!isNaN(r)) parsedRank = r;
            }

            return {
                ...s,
                id: String(s.id || ''), 
                name: String(s.name || ''),
                position: String(s.position || ''),
                username: String(s.username || '').trim(), // Trim whitespace
                password: String(s.password || '').trim(), // Trim whitespace & ensure string
                role: (s.role || 'staff') as UserRole,
                currentStatus: s.currentStatus || StaffStatus.IN_OFFICE,
                rank: parsedRank
            };
        });

        // Sort by rank ascending
        return mappedStaff.sort((a: Staff, b: Staff) => (a.rank || 0) - (b.rank || 0));

    } catch (error) {
        console.error("Error fetching staff:", error);
        return [];
    }
  },

  getMovements: async (): Promise<Movement[]> => {
    try {
        // Added timestamp to prevent browser caching
        const response = await fetch(`${API_URL}?action=getMovements&_t=${Date.now()}`);
        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((m: any) => ({
            ...m,
            id: String(m.id || ''),
            staffId: String(m.staffId || ''),
            dateOut: String(m.dateOut || ''),
            dateReturn: String(m.dateReturn || ''),
            location: String(m.location || ''),
            state: String(m.state || ''),
            purpose: String(m.purpose || ''),
        }));
    } catch (error) {
        console.error("Error fetching movements:", error);
        return [];
    }
  },

  addStaff: async (staff: Omit<Staff, 'id' | 'currentStatus'>) => {
    const id = Date.now().toString();
    const payload = { ...staff, id, currentStatus: StaffStatus.IN_OFFICE };
    await sendPostRequest("addStaff", payload);
    return payload;
  },

  updateStaff: async (staff: Staff) => {
    await sendPostRequest("updateStaff", staff);
  },

  deleteStaff: async (id: string) => {
    await sendPostRequest("deleteStaff", { id });
  },

  addMovement: async (movement: Omit<Movement, 'id' | 'statusFrequency'>) => {
    const id = 'm' + Date.now().toString();
    
    // Status Frequency logic (for the movement record itself)
    const today = new Date();
    today.setHours(0,0,0,0);
    const dRet = new Date(movement.dateReturn);
    dRet.setHours(0,0,0,0);
    
    const statusFreq = dRet >= today ? StaffStatus.OUT_OF_OFFICE : StaffStatus.IN_OFFICE;

    const payload = { ...movement, id, statusFrequency: statusFreq };

    await sendPostRequest("addMovement", payload);
    return payload;
  },

  updateMovement: async (movement: Movement) => {
    // Recalculate status frequency in case dates changed
    const today = new Date();
    today.setHours(0,0,0,0);
    const dRet = new Date(movement.dateReturn);
    dRet.setHours(0,0,0,0);
    const statusFreq = dRet >= today ? StaffStatus.OUT_OF_OFFICE : StaffStatus.IN_OFFICE;

    const payload = { ...movement, statusFrequency: statusFreq };

    await sendPostRequest("updateMovement", payload);
    return payload;
  },

  deleteMovement: async (id: string) => {
    await sendPostRequest("deleteMovement", { id });
  },
  
  syncStaffStatus: async (staffList: Staff[], movementList: Movement[]) => {
      const updatedList = staffList.map(staff => {
          const staffMoves = movementList.filter(m => String(m.staffId) === String(staff.id));
          staffMoves.sort((a, b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime());
          
          const computedStatus = calculateStatus(staffMoves);
          
          if (computedStatus !== staff.currentStatus) {
              db.updateStaff({ ...staff, currentStatus: computedStatus }).catch(err => console.error("Sync error", err));
              return { ...staff, currentStatus: computedStatus };
          }
          return staff;
      });
      return updatedList;
  }
};
