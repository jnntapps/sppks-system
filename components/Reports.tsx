
import React, { useState, useMemo } from 'react';
import { Staff, Movement } from '../types';
import { formatDate } from '../utils';
import { FileText, Printer, Filter, Calendar, User, Download, MapPin } from 'lucide-react';

interface ReportsProps {
  staffList: Staff[];
  movements: Movement[];
}

const Reports: React.FC<ReportsProps> = ({ staffList, movements }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');

  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  const years = [currentYear - 1, currentYear, currentYear + 1];

  // Filter Logic
  const filteredData = useMemo(() => {
    return movements.filter(m => {
      // Parse date safely from YYYY-MM-DD string
      const dateParts = m.dateOut.split('T')[0].split('-');
      const mYear = parseInt(dateParts[0]);
      const mMonth = parseInt(dateParts[1]) - 1; // 0-indexed

      const matchDate = mYear === selectedYear && mMonth === selectedMonth;
      const matchStaff = selectedStaffId === 'all' || String(m.staffId) === selectedStaffId;

      return matchDate && matchStaff;
    }).sort((a, b) => new Date(a.dateOut).getTime() - new Date(b.dateOut).getTime());
  }, [movements, selectedMonth, selectedYear, selectedStaffId]);

  const handlePrint = () => {
    window.print();
  };

  const getStaffName = (id: string) => {
      const staff = staffList.find(s => String(s.id) === String(id));
      return staff ? staff.name : 'Staf Tidak Dikenali';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Controls - Hidden when printing */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600"/> Laporan Bulanan
                </h2>
                <p className="text-slate-500 text-sm">Jana laporan pergerakan mengikut bulan dan pegawai.</p>
            </div>
            <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
                <Printer size={18} /> Cetak / PDF
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Selector */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Tahun</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Month Selector */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Bulan</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                    >
                        {months.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Staff Selector */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Pegawai</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                    <select 
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                    >
                        <option value="all">-- Semua Pegawai --</option>
                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* Report Paper View */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[600px] print:shadow-none print:border-none print:p-0">
        
        {/* Report Header */}
        <div className="text-center border-b border-slate-800 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide mb-2">Laporan Pergerakan Pegawai</h1>
            <h2 className="text-lg font-semibold text-slate-600">Jemaah Nazir Negeri Terengganu</h2>
            <div className="mt-4 inline-block bg-slate-100 px-6 py-2 rounded-full border border-slate-200 print:bg-transparent print:border-none">
                <span className="font-bold text-slate-800">{months[selectedMonth]} {selectedYear}</span>
                {selectedStaffId !== 'all' && (
                    <span className="text-slate-600 block text-sm mt-1">{getStaffName(selectedStaffId)}</span>
                )}
            </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8 print:mb-6">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:border-slate-300">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Jumlah Pergerakan</p>
                <p className="text-2xl font-bold text-slate-800">{filteredData.length}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:border-slate-300">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tarikh Cetakan</p>
                <p className="text-lg font-semibold text-slate-800">{new Date().toLocaleDateString('ms-MY')}</p>
             </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                        <th className="py-3 px-4 font-bold border-r border-slate-300 w-12 text-center">#</th>
                        <th className="py-3 px-4 font-bold border-r border-slate-300 w-32">Tarikh</th>
                        {selectedStaffId === 'all' && (
                            <th className="py-3 px-4 font-bold border-r border-slate-300 w-48">Nama Pegawai</th>
                        )}
                        <th className="py-3 px-4 font-bold border-r border-slate-300">Lokasi & Tujuan</th>
                        <th className="py-3 px-4 font-bold w-24 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                    {filteredData.map((m, index) => (
                        <tr key={m.id} className="break-inside-avoid hover:bg-slate-50">
                            <td className="py-3 px-4 border-r border-slate-200 text-center text-slate-500">{index + 1}</td>
                            <td className="py-3 px-4 border-r border-slate-200 align-top">
                                <div className="font-semibold text-slate-800 whitespace-nowrap">{formatDate(m.dateOut)}</div>
                                {m.dateOut !== m.dateReturn && (
                                    <div className="text-xs text-slate-500 mt-1">Hingga<br/>{formatDate(m.dateReturn)}</div>
                                )}
                            </td>
                            {selectedStaffId === 'all' && (
                                <td className="py-3 px-4 border-r border-slate-200 align-top font-medium text-slate-700">
                                    {m.staffName}
                                </td>
                            )}
                            <td className="py-3 px-4 border-r border-slate-200 align-top">
                                <div className="font-bold text-slate-800 flex items-start gap-1 mb-1">
                                    <MapPin size={14} className="mt-0.5 text-red-500 shrink-0"/> {m.location}, {m.state}
                                </div>
                                <div className="text-slate-600 italic leading-relaxed">"{m.purpose}"</div>
                            </td>
                            <td className="py-3 px-4 text-center align-top">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-slate-200">
                                    Selesai
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={selectedStaffId === 'all' ? 5 : 4} className="py-12 text-center text-slate-400 italic bg-slate-50/50">
                                Tiada rekod pergerakan dijumpai untuk kriteria ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer Signature Area (Print Only) */}
        <div className="hidden print:flex justify-between mt-16 pt-8 border-t border-slate-300 break-inside-avoid">
            <div className="text-center w-64">
                <p className="text-xs text-slate-500 mb-16">Disediakan Oleh:</p>
                <div className="border-t border-slate-400 w-full"></div>
                <p className="text-sm font-bold mt-2 text-slate-800">(PENTADBIR SISTEM)</p>
            </div>
            <div className="text-center w-64">
                <p className="text-xs text-slate-500 mb-16">Disahkan Oleh:</p>
                <div className="border-t border-slate-400 w-full"></div>
                <p className="text-sm font-bold mt-2 text-slate-800">(KETUA JABATAN)</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
