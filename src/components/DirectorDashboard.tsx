import React, { useState } from 'react';
import { Lang, Theme, Appointment, WeeklySchedule, AppointmentStatus } from '../types';
import { translations } from '../translations';
import { 
  BarChart, Search, Calendar, Clock, CheckCircle, XCircle, FileText, ChevronDown, 
  User, Check, X, Printer, Plus, ShieldCheck, Mail, Sliders, Trash, AlertCircle, Sparkles, SlidersHorizontal, Settings
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
  onUpdateProfile?: (name: string, phone: string, password?: string) => void;
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
  const [editPassword, setEditPassword] = useState<string>('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      alert(isRtl ? 'الرجاء إدخال الاسم كاملاً' : 'Name is required');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile(editName.trim(), editPhone.trim(), editPassword.trim() || undefined);
      setProfileSuccessMsg(isRtl ? '✓ تم تحديث البيانات بنجاح!' : '✓ Director profile updated successfully!');
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
    setScheduleSuccessMsg(isRtl ? '✓ تمت إضافة الفترة الزمنية لجدول الاستقبال بنجاح!' : '✓ New reception slot registered successfully!');
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
    <div className="space-y-8 animate-fade-in theme-transition">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-black uppercase">
            <Sparkles className="w-3 h-3" />
            <span>{isRtl ? 'قمرة المراقبة الإدارية' : 'Executive Control Center'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <Sliders className="text-blue-600 w-5 h-5" />
            <span>{t.dirDashboardTitles}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            {isRtl 
              ? 'توجيه طلبات المقابلات، ضبط فترات الحضور الأسبوعية، وتحميل تقارير الكفاءة التشغيلية والامتثال.'
              : 'Approve student entries, configure weekly availability slots, and download compliance audits.'}
          </p>
        </div>
        <button
          onClick={triggerExportReport}
          className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold py-2.5 px-5 rounded-full text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/15 self-start md:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{t.exportReport}</span>
        </button>
      </div>

      {/* Bento Stats Grid - Premium Custom Cards with subtle inner shadows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Core total */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
        } flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{t.dirStatsTotal}</div>
            <div className="text-3xl font-black text-slate-850 dark:text-slate-50 mt-1">{totalCount}</div>
          </div>
          <div className="bg-blue-500/10 text-blue-600 p-3 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Confirmed */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
        } flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{t.dirStatsConfirmed}</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{confirmedCount}</div>
          </div>
          <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Pending email */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
        } flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{t.dirStatsPending}</div>
            <div className="text-3xl font-black text-amber-500 dark:text-amber-400 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-amber-500/10 text-amber-600 p-3 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
        } flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{t.dirStatsCompleted}</div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{completedCount}</div>
          </div>
          <div className="bg-indigo-500/10 text-indigo-600 p-3 rounded-2xl">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Collapsible Profile Settings Panel */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
      } shadow-xs`}>
        <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsEditingProfile(!isEditingProfile)}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 text-indigo-600 p-2.5 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                {isRtl ? 'بيانات وإعدادات حساب مدير المعهد' : 'Director Profile Settings'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                {isRtl ? 'الاسم الحالي: ' : 'Current: '} <span className="font-extrabold text-[#52aba5]">{currentUser?.name || editName}</span>
              </p>
            </div>
          </div>
          <button className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline">
            {isEditingProfile ? (isRtl ? 'إغلاق ✕' : 'Close ✕') : (isRtl ? 'تعديل ✎' : 'Edit ✎')}
          </button>
        </div>

        {isEditingProfile && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4 max-w-2xl animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase block">{isRtl ? 'اسم مدير المعهد:' : 'Director Full Name:'}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                    theme === 'dark' ? 'border-slate-800 text-slate-100 focus:bg-slate-950/20' : 'border-slate-200 text-slate-800 focus:bg-slate-50/20'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase block">{isRtl ? 'رقم هاتف التواصل:' : 'Phone Number:'}</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                    theme === 'dark' ? 'border-slate-800 text-slate-100 focus:bg-slate-950/20' : 'border-slate-200 text-slate-800 focus:bg-slate-50/20'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase block">{isRtl ? 'كلمة المرور الإدارية:' : 'Administrative Password:'}</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder={isRtl ? 'تعيين كلمة مرور جديدة' : 'Set new password'}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                    theme === 'dark' ? 'border-slate-800 text-slate-100 focus:bg-slate-950/20' : 'border-slate-200 text-slate-800 focus:bg-slate-50/20'
                  }`}
                />
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-2.5 bg-green-500/5 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl border border-green-500/10">
                {profileSuccessMsg}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveProfile}
                className="bg-blue-600 hover:bg-blue-700 active:scale-97 text-white font-black py-2 px-5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                {isRtl ? 'حفظ التعديلات' : 'Update Profile'}
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 font-bold py-2 px-4 rounded-xl text-xs transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter and Appointments List */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
        theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
      } shadow-sm space-y-5`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-850 dark:text-slate-100">
              {isRtl ? 'إدارة وجدولة طلبات المقابلات الأكاديمية' : 'Scheduled Entry Review Queue'}
            </h3>
          </div>
          
          {/* Status sliding pills tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100/60 dark:bg-slate-950 p-1 rounded-full text-[11px] font-sans border border-slate-200/30 dark:border-slate-800 self-start xl:self-auto">
            {[
              { id: 'all', label: t.all },
              { id: 'pending_email', label: t.pending_email },
              { id: 'confirmed', label: t.confirmed },
              { id: 'completed', label: t.completed }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-full transition-all duration-200 font-extrabold cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Searching input bar with custom visual search lens */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-full border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
              theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/35' : 'border-slate-200 focus:bg-slate-50/30'
            }`}
          />
        </div>

        {/* Render queue list */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto opacity-20 text-slate-500" />
            <p className="font-bold">{t.noAppointmentsMatch}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {filteredAppointments.map((apt) => {
              const statusBadge = {
                pending_email: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
                confirmed: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
                cancelled: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
                completed: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
              };

              return (
                <div key={apt.id} className="py-5 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-lg">
                        {apt.id}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">{apt.studentName}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">({new Date(apt.createdAt).toLocaleDateString()})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${statusBadge[apt.status]}`}>
                        {t[apt.status]}
                      </span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-100'
                  }`}>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">{isRtl ? 'معلومات الاتصال بالمرسل' : 'Contact & ID Channel'}</span>
                      <p className="font-mono text-slate-800 dark:text-slate-200 font-bold">{apt.studentEmail}</p>
                      <p className="font-mono text-slate-500 dark:text-slate-400 mt-0.5 font-bold">{apt.studentPhone}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">{isRtl ? 'موعد الاستقبال المجدول' : 'Allocated Visit Time'}</span>
                      <p className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{apt.date}</span>
                      </p>
                      <p className="font-mono flex items-center gap-1.5 text-slate-550 dark:text-slate-400 mt-0.5 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.timeSlot}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">{isRtl ? 'سبب تقديم المقابلة' : 'Reason for Meeting'}</span>
                      <p className="italic text-slate-650 dark:text-slate-350 leading-relaxed font-medium">“{apt.reason}”</p>
                    </div>
                  </div>

                  {/* Notes editing block */}
                  {apt.managerNotes && editingAptId !== apt.id && (
                    <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 text-xs rounded-xl italic font-medium">
                      <span className="font-extrabold text-blue-600 block not-italic text-[10px] mb-1 tracking-wider uppercase">{isRtl ? 'التوجيه الإداري المسجل للطلب:' : 'Recorded Executive Instructions:'}</span>
                      “{apt.managerNotes}”
                    </div>
                  )}

                  {editingAptId === apt.id ? (
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-3 animate-fade-in">
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder={isRtl ? 'اكتب ملاحظاتك، توجيهك، أو الملاحظات التي ستظهر للطالب فوراً في حسابه الموثق...' : 'Write instructions or guidance for the student...'}
                        className={`w-full p-3 text-xs rounded-xl border bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none ${
                          theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/20' : 'border-slate-200 focus:bg-slate-50/20'
                        }`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingAptId(null)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg font-bold"
                        >
                          {isRtl ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleSaveNotes(apt.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-sm cursor-pointer animate-pulse-glow"
                        >
                          {isRtl ? 'حفظ ملاحظات الزيارة' : 'Save Notes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 justify-between items-center pt-1 border-t border-slate-50 dark:border-slate-850/60">
                      <button
                        onClick={() => {
                          setEditingAptId(apt.id);
                          setNotesInput(apt.managerNotes || '');
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-bold flex items-center gap-1.5"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{apt.managerNotes ? (isRtl ? 'تعديل توجيه الزيارة ✎' : 'Edit notes ✎') : (isRtl ? 'إضافة توجيه وملاحظات المدير ✎' : 'Add decision notes ✎')}</span>
                      </button>

                      <div className="flex gap-1.5">
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.markCompleted}</span>
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                            className="bg-rose-600 hover:bg-rose-700 active:scale-97 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
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

      {/* Grid Settings: Managed Slots & Configuration Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Availability Slot Configuration */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
        } shadow-sm space-y-4`}>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                {t.dayScheduleTitle}
              </h3>
            </div>
            <span className="text-[10px] text-blue-600 font-extrabold bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              {slotsList.length} slots active
            </span>
          </div>

          {scheduleSuccessMsg && (
            <div className="p-3 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-2xl text-xs flex gap-2 items-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{scheduleSuccessMsg}</span>
            </div>
          )}

          {/* List of active slots in schedule */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {slotsList.map((slot) => (
              <div
                key={slot.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all duration-200 ${
                  slot.isActive
                    ? (theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-100')
                    : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/20 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800 dark:text-slate-100">
                    {daysNameMap[slot.dayOfWeek]}
                  </span>
                  <span className="font-mono bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 px-2.5 py-0.5 rounded text-[11px] font-bold">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-medium">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRtl ? `الاستيعاب: ${slot.maxCapacity} طلبة` : `Cap: ${slot.maxCapacity} studs`}
                  </span>
                  <button
                    onClick={() => handleToggleSlotActive(slot.id)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase transition-all cursor-pointer ${
                      slot.isActive
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-slate-200/60 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {slot.isActive ? (isRtl ? 'نشط' : 'active') : (isRtl ? 'معطل' : 'inactive')}
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-full transition"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Entry Slot Form Column */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
        } shadow-sm space-y-4`}>
          <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2.5 uppercase tracking-wide">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{t.addTimeSlot}</span>
          </h4>

          {/* New Slot Inputs */}
          <div className="space-y-3.5 text-xs font-medium">
            <div className="space-y-1">
              <label className="block text-slate-400 font-bold mb-1">{t.dayOfWeek}</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none ${
                  theme === 'dark' ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
                }`}
              >
                <option value={0}>{isRtl ? 'الأحد' : 'Sunday'}</option>
                <option value={1}>{isRtl ? 'الاثنين' : 'Monday'}</option>
                <option value={2}>{isRtl ? 'الثلاثاء' : 'Tuesday'}</option>
                <option value={3}>{isRtl ? 'الأربعاء' : 'Wednesday'}</option>
                <option value={4}>{isRtl ? 'الخميس' : 'Thursday'}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold mb-1">{isRtl ? 'بداية الفترة' : 'Start Time'}</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none ${
                    theme === 'dark' ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-400 font-bold mb-1">{isRtl ? 'نهاية الفترة' : 'End Time'}</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none ${
                    theme === 'dark' ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-bold mb-1">{t.capacity}</label>
              <input
                type="number"
                min={1}
                max={15}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-indigo-500 outline-none ${
                  theme === 'dark' ? 'border-slate-800 text-slate-100' : 'border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <button
              onClick={handleAddSlot}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-99 text-white font-extrabold rounded-full transition-all shadow-md shadow-indigo-500/15 cursor-pointer mt-1"
            >
              {isRtl ? 'إدراج الفترة في الجدول' : 'Insert Availability slot'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistical Comprehensive Audit Report simulated modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-fade-in text-slate-800 dark:text-slate-100">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-500/15 text-blue-600 rounded-lg">
                  <Printer className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-850 dark:text-slate-100">
                  {isRtl ? 'ملف التصدير والتقارير التنظيمية' : 'Bilingual Compliance Audit'}
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-3.5 text-xs border border-slate-200/50 dark:border-slate-900">
              <p className="font-black text-center text-blue-600 border-b border-slate-200/40 dark:border-slate-800/80 pb-3 uppercase tracking-wider">
                {isRtl 
                  ? 'بوابة المعهد الأكاديمية - تقارير الكفاءة التشغيلية والخصوصية' 
                  : 'Institute Office Audit - System Efficiency Report'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300 font-mono font-medium">
                <div>• {isRtl ? 'تاريخ التوليد التلقائي:' : 'Generated Date:'} <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleString()}</span></div>
                <div>• {isRtl ? 'إجمالي طلبات الجدولة:' : 'Total entries logged:'} <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span></div>
                <div>• {isRtl ? 'المعدل الفعال للقبول:' : 'Confirmed ratio:'} <span className="font-bold text-slate-900 dark:text-white">{totalCount > 0 ? ((confirmedCount/totalCount)*100).toFixed(0) : 0}%</span></div>
                <div>• {isRtl ? 'تراخيص الأمن والخصوصية:' : 'Safety Standard:'} <span className="text-emerald-500 font-black">PDPL / GDPR Compliance Pass</span></div>
              </div>

              {/* Data Rows for the report table */}
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 mt-2 space-y-1.5 max-h-[160px] overflow-y-auto">
                <div className="text-[10px] uppercase font-black text-slate-400 mb-1">{isRtl ? 'تفصيل الأسبوع المجدول (موجز):' : 'Summary Logs:'}</div>
                {appointments.map(a => (
                  <div key={a.id} className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 border-b border-slate-200/20 dark:border-slate-900 py-1">
                    <span className="font-bold">{a.id}</span>
                    <span className="truncate max-w-[120px]">{a.studentName}</span>
                    <span>{a.date} | {a.timeSlot}</span>
                    <span className="font-black uppercase text-[9px] text-blue-500">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed text-center italic font-medium">
              {exportMessage}
            </p>

            <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100 dark:border-slate-850/60">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-97 text-white font-extrabold rounded-full text-xs transition-all shadow-md cursor-pointer"
              >
                {isRtl ? 'طباعة التقرير الشامل' : 'Print complete file'}
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 font-bold py-2 px-4 rounded-full text-xs transition cursor-pointer"
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
