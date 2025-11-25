
import React, { useState, useEffect } from 'react';
import { Staff, UserRole, Movement, MALAYSIA_STATES } from '../types';
import { db } from '../services/mockDatabase';
import { formatDate } from '../utils';
import { UserPlus, Trash2, Edit2, Shield, X, Save, AlertTriangle, Loader2, List, FileText, MapPin } from 'lucide-react';

interface AdminPanelProps {
  staffList: Staff[];
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ staffList, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'movements'>('staff');
  
  // --- STAFF STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ name: '', position: '', username: '', password: '', role: UserRole.STAFF });
  
  // --- MOVEMENT STATE ---
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null);
  
  // Movement Editing State
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [movementFormData, setMovementFormData] = useState<Partial<Movement>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'movements') fetchAllMovements();
  }, [activeTab]);

  const fetchAllMovements = async () => {
    setLoadingMovements(true);
    try {
        const m = await db.getMovements();
        m.sort((a,b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime());
        setAllMovements(m);
    } catch (e) {
        console.error("Error fetching movements", e);
    } finally {
        setLoadingMovements(false);
    }
  };

  // --- CRUD HANDLERS ---
  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingId(staff.id);
      setFormData({ name: staff.name, position: staff.position, username: staff.username, password: staff.password || '', role: staff.role });
    } else {
      setEditingId(null);
      setFormData({ name: '', position: '', username: '', password: '', role: UserRole.STAFF });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (editingId) {
            const original = staffList.find(s => s.id === editingId);
            if (original) await db.updateStaff({ ...original, ...formData });
        } else {
            // Default rank is just the end of the list
            const maxRank = staffList.length + 1;
            await db.addStaff({ ...formData, rank: maxRank });
        }
        await onUpdate();
        setIsModalOpen(false);
    } catch (e) {
        alert('Ralat menyimpan data.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditMovement = (move: Movement) => {
      let cleanDateOut = move.dateOut;
      let cleanDateReturn = move.dateReturn;
      if (cleanDateOut && cleanDateOut.includes('T')) cleanDateOut = cleanDateOut.split('T')[0];
      if (cleanDateReturn && cleanDateReturn.includes('T')) cleanDateReturn = cleanDateReturn.split('T')[0];

      setMovementFormData({ ...move, dateOut: cleanDateOut, dateReturn: cleanDateReturn });
      setIsMovementModalOpen(true);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!movementFormData.id || !movementFormData.dateOut || !movementFormData.dateReturn) return;
      setIsSubmittingMove(true);
      try {
          await db.updateMovement(movementFormData as Movement);
          await fetchAllMovements();
          onUpdate();
          setIsMovementModalOpen(false);
      } catch (e) {
          alert("Gagal mengemaskini pergerakan.");
      } finally {
          setIsSubmittingMove(false);
      }
  };

  const handleDeleteMovementClick = (id: string) => setMovementToDelete(id);

  const confirmDeleteMovement = async () => {
     if (!movementToDelete) return;
     setIsSubmitting(true);
     try {
         await db.deleteMovement(movementToDelete);
         const updatedMovements = allMovements.filter(m => m.id !== movementToDelete);
         setAllMovements(updatedMovements);
         await onUpdate(); 
         setMovementToDelete(null); 
     } catch (e) {
         alert("Gagal memadam.");
     } finally {
         setIsSubmitting(false);
     }
  };

  const confirmDeleteStaff = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
        await db.deleteStaff(deleteTarget.id);
        await onUpdate();
        setDeleteTarget(null);
    } catch (e) {
        alert("Gagal memadam staf.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-2 md:pb-4 gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Panel Admin</h2>
            <p className="text-slate-500 text-xs md:text-sm">Urus staf dan rekod pergerakan.</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg w-full md:w-auto">
            <button onClick={() => setActiveTab('staff')} className={`flex-1 md:flex-none px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'staff' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
                <List size={16}/> Staf
            </button>
            <button onClick={() => setActiveTab('movements')} className={`flex-1 md:flex-none px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'movements' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
                <FileText size={16}/> Rekod
            </button>
        </div>
      </div>

      {activeTab === 'staff' ? (
        <>
            {/* TOOLBAR */}
            <div className="flex justify-end items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-primary hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow-sm transition-colors">
                    <UserPlus size={18} /> Daftar Baru
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                        <th className="px-4 md:px-6 py-3">Nama</th>
                        <th className="px-4 md:px-6 py-3">Jawatan</th>
                        <th className="px-4 md:px-6 py-3">Peranan</th>
                        <th className="px-4 md:px-6 py-3 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {staffList.map((staff) => {
                            return (
                                <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 md:px-6 py-3 font-medium text-slate-900">
                                        {staff.name}
                                        <div className="text-[10px] text-slate-400 font-mono">{staff.username}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3">{staff.position}</td>
                                    <td className="px-4 md:px-6 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                            staff.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {staff.role === UserRole.ADMIN && <Shield size={10} />}
                                            {staff.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(staff)} className="text-blue-600 p-1 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={16} /></button>
                                        <button onClick={() => setDeleteTarget(staff)} className="text-red-500 p-1 bg-red-50 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {staffList.length === 0 && (
                             <tr><td colSpan={4} className="p-6 text-center text-slate-400">Tiada staf didaftarkan.</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : (
          /* MOVEMENT TAB CONTENT */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
             {loadingMovements ? (
                 <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                     <Loader2 className="animate-spin mb-2" /> Loading...
                 </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 md:px-6 py-3">Nama</th>
                                <th className="px-4 md:px-6 py-3">Tarikh</th>
                                <th className="px-4 md:px-6 py-3">Lokasi & Tujuan</th>
                                <th className="px-4 md:px-6 py-3 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allMovements.map(move => (
                                <tr key={move.id} className="hover:bg-slate-50">
                                    <td className="px-4 md:px-6 py-3 font-medium text-slate-900">{move.staffName}</td>
                                    <td className="px-4 md:px-6 py-3">
                                        <div>{formatDate(move.dateOut)}</div>
                                        <div className="text-xs text-slate-400">Hingga {formatDate(move.dateReturn)}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 max-w-[200px] truncate">
                                        <div className="font-medium text-slate-800">{move.location}</div>
                                        <div className="text-xs text-slate-500 truncate">{move.purpose}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleEditMovement(move)} className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" title="Kemaskini">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteMovementClick(move.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors" title="Padam">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {allMovements.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-slate-400">Tiada rekod.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             )}
          </div>
      )}

      {/* STAFF Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingId ? 'Kemaskini Staf' : 'Daftar Staf Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium">Nama</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm font-medium">Jawatan</label><input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Username</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="text-sm font-medium">Password</label><input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div>
                <label className="text-sm font-medium">Peranan</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-3 py-2 border rounded-lg">
                  <option value={UserRole.STAFF}>Staf Biasa</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 rounded-lg flex justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOVEMENT Edit Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
             <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><MapPin size={18}/> Kemaskini Pergerakan</h3>
              <button onClick={() => setIsMovementModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleMovementSubmit} className="p-6 space-y-4">
               <div>
                  <label className="text-sm font-medium text-slate-700">Nama Staf</label>
                  <input type="text" value={movementFormData.staffName || ''} disabled className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-500" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Tarikh Keluar</label>
                    <input type="date" value={movementFormData.dateOut || ''} onChange={e => setMovementFormData({...movementFormData, dateOut: e.target.value})} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Tarikh Balik</label>
                    <input type="date" value={movementFormData.dateReturn || ''} onChange={e => setMovementFormData({...movementFormData, dateReturn: e.target.value})} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  </div>
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700">Lokasi</label>
                 <input type="text" value={movementFormData.location || ''} onChange={e => setMovementFormData({...movementFormData, location: e.target.value})} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700">Negeri</label>
                 <select value={movementFormData.state || ''} onChange={e => setMovementFormData({...movementFormData, state: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    {MALAYSIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               <div>
                 <label className="text-sm font-medium text-slate-700">Tujuan</label>
                 <textarea rows={2} value={movementFormData.purpose || ''} onChange={e => setMovementFormData({...movementFormData, purpose: e.target.value})} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
               </div>

               <button type="submit" disabled={isSubmittingMove} className="w-full bg-primary text-white font-bold py-3 rounded-lg flex justify-center gap-2">
                  {isSubmittingMove ? <Loader2 className="animate-spin" /> : <Save />} Kemaskini Rekod
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full animate-scale-in shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-inner"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Padam Data Staf?</h3>
            <p className="text-slate-500 mb-6 text-sm">Semua rekod pergerakan staf ini juga akan dipadam.</p>
            <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors w-1/2">Batal</button>
                <button onClick={confirmDeleteStaff} disabled={isSubmitting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors w-1/2 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Padam
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Delete Confirmation */}
      {movementToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full animate-scale-in shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-inner"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Padam Rekod Pergerakan?</h3>
            <p className="text-slate-500 text-sm mb-6">Tindakan ini tidak boleh dikembalikan.</p>
            <div className="flex gap-3 justify-center">
                <button onClick={() => setMovementToDelete(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors w-1/2">Batal</button>
                <button onClick={confirmDeleteMovement} disabled={isSubmitting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 w-1/2">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />} Padam
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
