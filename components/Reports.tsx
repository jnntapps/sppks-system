import React, { useState, useMemo } from 'react';
import { Staff, Movement } from '../types';
import { formatDate, normalizeDate, getTodayString } from '../utils';
import { FileText, Calendar, User, CalendarRange, ArrowRight, Filter, MapPin } from 'lucide-react';

interface ReportsProps {
  staffList: Staff[];
  movements: Movement[];
}

type ReportType = 'monthly' | 'range';

const Reports: React.FC<ReportsProps> = ({ staffList, movements }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  const todayStr = getTodayString();

  // State
  const [reportType, setReportType] = useState<ReportType>('monthly');
  
  // Monthly State
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Range State
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Common State
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');

  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  const years = [currentYear - 1, currentYear, currentYear + 1];

  // LOGIK FILTER
  const filteredData = useMemo(() => {
    let startRangeStr = '';
    let endRangeStr = '';

    if (reportType === 'monthly') {
        const monthStr = String(selectedMonth + 1).padStart(2, '0');
        startRangeStr = `${selectedYear}-${monthStr}-01`;
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        endRangeStr = `${selectedYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
    } else {
        startRangeStr = startDate;
        endRangeStr = endDate;
    }

    return movements.filter(m => {
      // Filter Pegawai dulu
      if (selectedStaffId !== 'all' && String(m.staffId) !== selectedStaffId) return false;

      // Bersihkan tarikh pergerakan
      const mStart = normalizeDate(m.dateOut);
      const mEnd = normalizeDate(m.dateReturn);

      // Jika tarikh rosak/kosong, skip
      if (!mStart || !mEnd) return false;

      // Formula Overlap: (MovementStart <= RangeEnd) && (MovementEnd >= RangeStart)
      const isOverlapping = (mStart <= endRangeStr) && (mEnd >= startRangeStr);

      return isOverlapping;
    }).sort((a, b) => {
        // Sort mengikut tarikh keluar (Ascending)
        return normalizeDate(a.dateOut).localeCompare(normalizeDate(b.dateOut));
    });
  }, [movements, reportType, selectedMonth, selectedYear, startDate, endDate, selectedStaffId]);

  const getStaffName = (id: string) => {
      const staff = staffList.find(s => String(s.id) === String(id));
      return staff ? staff.name : 'Staf Tidak Dikenali';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Controls */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600"/> Laporan Pergerakan
            </h2>
            <p className="text-slate-500 text-sm">Lihat rekod pergerakan mengikut bulan atau julat tarikh.</p>
        </div>

        {/* Tab Pilihan Jenis Laporan */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6 w-full md:w-fit">
            <button 
                onClick={() => setReportType('monthly')}
                className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${reportType === 'monthly' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Calendar size={16}/> Laporan Bulanan
            </button>
            <button 
                onClick={() => setReportType('range')}
                className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${reportType === 'range' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <CalendarRange size={16}/> Julat Tarikh
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Conditional Inputs based on Report Type */}
            {reportType === 'monthly' ? (
                <>
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
                </>
            ) : (
                <>
                    {/* Start Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Dari Tarikh</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Hingga Tarikh</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Staff Selector (Always Visible) */}
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
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
        
        {/* Report Header */}
        <div className="text-center border-b border-slate-800 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide mb-2">Laporan Pergerakan Pegawai</h1>
            <h2 className="text-lg font-semibold text-slate-600">Jemaah Nazir Negeri Terengganu</h2>
            
            <div className="mt-4 flex flex-col items-center gap-2">
                {reportType === 'monthly' ? (
                     <div className="inline-block bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                        <span className="font-bold text-slate-800">{months[selectedMonth]} {selectedYear}</span>
                     </div>
                ) : (
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                        <span className="font-bold text-slate-800">{formatDate(startDate)}</span>
                        <ArrowRight size={16} className="text-slate-400"/>
                        <span className="font-bold text-slate-800">{formatDate(endDate)}</span>
                    </div>
                )}
                
                {selectedStaffId !== 'all' && (
                    <span className="text-slate-600 font-medium">{getStaffName(selectedStaffId)}</span>
                )}
            </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Jumlah Pergerakan</p>
                <p className="text-2xl font-bold text-slate-800">{filteredData.length}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tarikh Dijana</p>
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
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                    {filteredData.map((m, index) => {
                        return (
                            <tr key={m.id} className="break-inside-avoid hover:bg-slate-50">
                                <td className="py-3 px-4 border-r border-slate-200 text-center text-slate-500 align-top">{index + 1}</td>
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
                            </tr>
                        );
                    })}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={selectedStaffId === 'all' ? 4 : 3} className="py-12 text-center text-slate-400 italic bg-slate-50/50">
                                Tiada rekod pergerakan dijumpai untuk kriteria ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-xs italic">
            Paparan Laporan Tamat.
        </div>
      </div>
    </div>
  );
};

export default Reports;
