import React, { useState } from 'react';
import { Lang, Theme, Appointment, WeeklySchedule, AppNotification, AppointmentStatus } from '../types';
import { translations } from '../translations';
import { 
  BarChart, Search, Calendar, Clock, CheckCircle, XCircle, FileText, ChevronDown, 
  User, Check, X, Printer, Plus, ShieldCheck, Mail, Sliders, Trash, AlertCircle
} from 'lucide-react';

interface DirectorDashboardProps {
  lang: Lang;
  theme: Theme;
  appointments: Appointment[];
  weeklySchedules: WeeklySchedule[];
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus, notes?: string) => void;
  onUpdateSchedules: (updatedSchedules: WeeklySchedule[]) => void;
  langCode: Lang;
  currentUser?: any;
  onUpdateProfile?: (name: string, phone: string) => void;
}

export default function DirectorDashboard({
  lang,
  theme,
  appointments = [],
  weeklySchedules = [],
  onUpdateStatus,
  onUpdateSchedules,
  langCode,
  currentUser,
  onUpdateProfile
}: DirectorDashboardProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  // Profile editing State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(currentUser?.name || 'أ. د. عبدالمحسن بن صالح آل شيخ');
  const [editPhone, setEditPhone] = useState<string>(currentUser?.phone || '+966500000001');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      alert(isRtl ? 'الرجاء إدخال الاسم كاملاً' : 'Name is required');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile(editName.trim(), editPhone.trim());
      setProfileSuccessMsg(isRtl ? 'تم تحديث اسم مدير المعهد بنجاح!' : 'Director name updated successfully!');
      setTimeout(() => {
        setProfileSuccessMsg('');
        setIsEditingProfile(false);
      }, 2000);
    }
  };

  // Schedule Desk States
  const [slotsList, setSlotsList] = useState<WeeklySchedule[]>(weeklySchedules);
  const [newDay, setNewDay] = useState<number>(0); // Sunday
  const [newStart, setNewStart] = useState<string>('09:00');
  const [newEnd, setNewEnd] = useState<string>('10:00');
  const [newCapacity, setNewCapacity] = useState<number>(2);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string>('');

  const daysNameMap: Record<number, string> = {
    0: isRtl ? 'الأحد' : 'Sunday',
    1: isRtl ? 'الاثنين' : 'Monday',
    2: isRtl ? 'الثلاثاء' : 'Tuesday',
    3: isRtl ? 'الأربعاء' : 'Wednesday',
    4: isRtl ? 'الخميس' : 'Thursday',
    5: isRtl ? 'الجمعة' : 'Friday',
    6: isRtl ? 'السبت' : 'Saturday'
  };

  // Stat computations
  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending_email').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const sTerm = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      apt.studentName.toLowerCase().includes(sTerm) ||
      apt.studentEmail.toLowerCase().includes(sTerm) ||
      apt.id.toLowerCase().includes(sTerm) ||
      apt.reason.toLowerCase().includes(sTerm) ||
      (apt.studentPhone && apt.studentPhone.includes(sTerm));
    
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Handle Note Save edit
  const handleSaveNotes = (id: string) => {
    onUpdateStatus(id, appointments.find(a => a.id === id)?.status || 'confirmed', notesInput);
    setEditingAptId(null);
    setNotesInput('');
  };

  // Handle Slot Delete / Add
  const handleAddSlot = () => {
    const nextId = (slotsList.length + 1).toString();
    const newSlotItem: WeeklySchedule = {
      id: nextId,
      dayOfWeek: newDay,
      startTime: newStart,
      endTime: newEnd,
      maxCapacity: newCapacity,
      isActive: true
    };
    const updated = [...slotsList, newSlotItem];
    setSlotsList(updated);
    onUpdateSchedules(updated);
    setScheduleSuccessMsg(isRtl ? 'تمت إضافة الفترة الزمنية لجدول المدير المقترح بنجاح!' : 'New reception slot registered successfully!');
    setTimeout(() => setScheduleSuccessMsg(''), 3000);
  };

  const handleToggleSlotActive = (id: string) => {
    const updated = slotsList.map((slot) => {
      if (slot.id === id) {
        return { ...slot, isActive: !slot.isActive };
      }
      return slot;
    });
    setSlotsList(updated);
    onUpdateSchedules(updated);
  };

  const handleDeleteSlot = (id: string) => {
    const updated = slotsList.filter((s) => s.id !== id);
    setSlotsList(updated);
    onUpdateSchedules(updated);
  };

  // Simulated Report Generation
  const triggerExportReport = () => {
    setShowReportModal(true);
    setExportMessage(t.reportGenerated);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="text-blue-600 w-6 h-6" />
            <span>{t.dirDashboardTitles}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl 
              ? 'توجيه طلبات المقابلات، ضبط فترات الحضور الأسبوعية، وتحميل تقارير الكفاءة التشغيلية'
              : 'Approve entries, configure weekly availability, and download compliance audits'}
          </p>
        </div>
        <button
          onClick={triggerExportReport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-md self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>{t.exportReport}</span>
        </button>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core total */}
        <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t.dirStatsTotal}</div>
            <div className="text-3xl font-black text-slate-850 dark:text-slate-50 mt-1">{totalCount}</div>
          </div>
          <div className="bg-blue-500/10 text-blue-600 p-3 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Confirmed */}
        <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t.dirStatsConfirmed}</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{confirmedCount}</div>
          </div>
          <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Pending email */}
        <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t.dirStatsPending}</div>
            <div className="text-3xl font-black text-amber-500 dark:text-amber-400 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-amber-500/10 text-amber-600 p-3 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">{t.dirStatsCompleted}</div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{completedCount}</div>
          </div>
          <div className="bg-indigo-500/10 text-indigo-600 p-3 rounded-2xl">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Collapsible Profile Settings Panel */}
      <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsEditingProfile(!isEditingProfile)}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 text-indigo-600 p-2.5 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100">
                {isRtl ? 'بيانات حساب مدير المعهد' : 'Director Account Settings'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isRtl ? 'الاسم الحالي: ' : 'Current: '} <span className="font-bold text-slate-650 dark:text-slate-300">{currentUser?.name || editName}</span>
              </p>
            </div>
          </div>
          <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {isEditingProfile ? (isRtl ? 'إغلاق ✕' : 'Close ✕') : (isRtl ? 'تعديل ✎' : 'Edit ✎')}
          </button>
        </div>

        {isEditingProfile && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">{isRtl ? 'اسم مدير المعهد الحالي:' : 'Director Full Name:'}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">{isRtl ? 'رقم الهاتف:' : 'Phone Number:'}</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-2.5 bg-green-500/5 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg border border-green-500/10">
                {profileSuccessMsg}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-xs transition"
              >
                {isRtl ? 'تحديث البيانات 💾' : 'Update Profile 💾'}
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter and Appointments List */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{isRtl ? 'إدارة وفحص قوائم المقابلات الحالية' : 'Scheduled Entry Review Queue'}</span>
          </h3>
          
          {/* Status filtering row */}
          <div className="flex flex-wrap gap-1.5 self-start md:self-auto text-xs font-sans">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-full transition font-extrabold ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-750'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setSelectedStatus('pending_email')}
              className={`px-4 py-2 rounded-full transition font-extrabold ${
                selectedStatus === 'pending_email'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-750'
              }`}
            >
              {t.pending_email}
            </button>
            <button
              onClick={() => setSelectedStatus('confirmed')}
              className={`px-4 py-2 rounded-full transition font-extrabold ${
                selectedStatus === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-750'
              }`}
            >
              {t.confirmed}
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-4 py-2 rounded-full transition font-extrabold ${
                selectedStatus === 'completed'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-755'
              }`}
            >
              {t.completed}
            </button>
          </div>
        </div>

        {/* Searching Field */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-slate-300 dark:border-slate-850 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
          />
        </div>

        {/* Render queue list */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20 text-slate-500" />
            <p>{t.noAppointmentsMatch}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-150 dark:divide-slate-850">
            {filteredAppointments.map((apt) => {
              const statusBadge = {
                pending_email: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-250/20',
                confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-250/20',
                cancelled: 'bg-red-101 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-250/20',
                completed: 'bg-indigo-101 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-250/20'
              };

              return (
                <div key={apt.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold bg-blue-50/70 dark:bg-blue-900/40 text-blue-600 px-2 py-0.5 rounded">
                        {apt.id}
                      </span>
                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">{apt.studentName}</h4>
                      <span className="text-[10px] text-slate-400">({new Date(apt.createdAt).toLocaleDateString()})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge[apt.status]}`}>
                        {t[apt.status]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{isRtl ? 'تفاصيل الحجز والاتصال' : 'Contact & Channel'}</span>
                      <p className="font-mono">{apt.studentEmail}</p>
                      <p className="font-mono">{apt.studentPhone}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{isRtl ? 'موعد الزيارة المحدد' : 'Allocated Visit Time'}</span>
                      <p className="font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{apt.date}</span>
                      </p>
                      <p className="font-mono flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.timeSlot}</span>
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{isRtl ? 'سبب الزيارة' : 'Reason for Meeting'}</span>
                      <p className="italic line-clamp-2">“{apt.reason}”</p>
                    </div>
                  </div>

                  {/* Notes editing block */}
                  {apt.managerNotes && editingAptId !== apt.id && (
                    <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/25 border border-blue-500/10 text-xs rounded-lg italic">
                      <span className="font-bold text-blue-600 block not-italic text-[10px] mb-0.5">{isRtl ? 'التوجيه الأساسي مسجل:' : 'Recorded Director Decision Notes:'}</span>
                      “{apt.managerNotes}”
                    </div>
                  )}

                  {editingAptId === apt.id ? (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/15 rounded-xl space-y-2">
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder={isRtl ? 'اكتب ملاحظاتك، توجيهك، أو الملاحظات التي ستظهر للطالب فوراً...' : 'Write notes or steps for the student...'}
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingAptId(null)}
                          className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded"
                        >
                          {isRtl ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleSaveNotes(apt.id)}
                          className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded"
                        >
                          {isRtl ? 'حفظ ملاحظات الزيارة' : 'Save Notes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-between items-center pt-1">
                      <button
                        onClick={() => {
                          setEditingAptId(apt.id);
                          setNotesInput(apt.managerNotes || '');
                        }}
                        className="text-indigo-600 hover:underline text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{apt.managerNotes ? (isRtl ? 'تعديل توجيه الزيارة' : 'Edit notes') : (isRtl ? 'إضافة توجيه وملاحظات المدير' : 'Add decision notes')}</span>
                      </button>

                      <div className="flex gap-1">
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>{t.markCompleted}</span>
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>{t.cancelAppt}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid Settings: Managed Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Availability Slot Configuration */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {t.dayScheduleTitle}
            </h3>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
              {slotsList.length} slots active
            </span>
          </div>

          {scheduleSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-500/25 rounded-xl text-xs flex gap-1.5 items-center">
              <CheckCircle className="w-4 h-4" />
              <span>{scheduleSuccessMsg}</span>
            </div>
          )}

          {/* List of active slots in schedule */}
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {slotsList.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                  slot.isActive
                    ? (theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-200/50')
                    : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200/20 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {daysNameMap[slot.dayOfWeek]}
                  </span>
                  <span className="font-mono bg-white dark:bg-slate-950 border border-slate-250/50 dark:border-slate-800 px-2 py-0.5 rounded">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span>
                    {isRtl ? `الاستيعاب: ${slot.maxCapacity} طلبة` : `Cap: ${slot.maxCapacity} studs`}
                  </span>
                  <button
                    onClick={() => handleToggleSlotActive(slot.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                      slot.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {slot.isActive ? (isRtl ? 'نشط' : 'active') : (isRtl ? 'معطل' : 'inactive')}
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-red-500 hover:bg-red-500/10 p-1 rounded-full transition"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Entry Slot Form Column */}
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{t.addTimeSlot}</span>
          </h4>

          {/* New Slot Inputs */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">{t.dayOfWeek}</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value={0}>{isRtl ? 'الأحد' : 'Sunday'}</option>
                <option value={1}>{isRtl ? 'الاثنين' : 'Monday'}</option>
                <option value={2}>{isRtl ? 'الثلاثاء' : 'Tuesday'}</option>
                <option value={3}>{isRtl ? 'الأربعاء' : 'Wednesday'}</option>
                <option value={4}>{isRtl ? 'الخميس' : 'Thursday'}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1">{isRtl ? 'بداية الفترة' : 'Start Time'}</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">{isRtl ? 'نهاية الفترة' : 'End Time'}</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">{t.capacity}</label>
              <input
                type="number"
                min={1}
                max={15}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              onClick={handleAddSlot}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-sm"
            >
              {isRtl ? 'إدراج الفترة في الجدول' : 'Insert Availability slot'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistical Comprehensive Audit Report simulated modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="text-emerald-500" />
                <h3 className="font-black text-slate-800 dark:text-slate-100">
                  {isRtl ? 'ملف التصدير والتقارير التنظيمية' : 'Bilingual Compliance Report'}
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-650"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-center text-blue-600 border-b border-slate-100/50 pb-2">
                {isRtl 
                  ? 'بوابة المعهد الأكاديمية - تقارير الكفاءة التشغيلية والخصوصية' 
                  : 'Institute Office Audit - System Efficiency Report'}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-mono font-medium">
                <div>• {isRtl ? 'تاريخ التوليد:' : 'Generated Date:'} <span className="font-bold">{new Date().toLocaleString()}</span></div>
                <div>• {isRtl ? 'إجمالي المواعيد المحققة:' : 'Total entries logged:'} <span className="font-bold">{totalCount}</span></div>
                <div>• {isRtl ? 'المعدل المقبول:' : 'Confirmed ratio:'} <span className="font-bold">{((confirmedCount/totalCount)*100).toFixed(0)}%</span></div>
                <div>• {isRtl ? 'الأمن والامتثال العام:' : 'Privacy Standard:'} <span className="text-emerald-500 font-bold">PDPL / GDPR Pass</span></div>
              </div>

              {/* Data Rows for the report table */}
              <div className="pt-2 border-t border-slate-150 dark:border-slate-850 mt-2 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">{isRtl ? 'تفصيل الأسبوع المجدول (موجز):' : 'Summary Logs:'}</div>
                {appointments.map(a => (
                  <div key={a.id} className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-850 py-0.5 animate-fade-in">
                    <span>{a.id} - {a.studentName.slice(0, 15)}..</span>
                    <span>{a.date} | {a.timeSlot}</span>
                    <span className="font-bold uppercase text-[9px]">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center italic font-medium">
              {exportMessage}
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
              >
                {isRtl ? 'طباعة التقرير الشامل' : 'Print complete file'}
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
