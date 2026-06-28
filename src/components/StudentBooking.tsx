import React, { useState } from 'react';
import { Lang, Theme, WeeklySchedule, Appointment, User } from '../types';
import { translations } from '../translations';
import { Calendar as CalendarIcon, Clock, Send, AlertTriangle, CheckCircle, ShieldAlert, FileText, Sparkles, ShieldCheck } from 'lucide-react';

interface StudentBookingProps {
  lang: Lang;
  theme: Theme;
  weeklySchedules: WeeklySchedule[];
  appointments: Appointment[];
  currentUser: User | null;
  onBookAppointment: (date: string, timeSlot: string, reason: string) => void;
  onNavigateToPortal: () => void;
}

export default function StudentBooking({
  lang,
  theme,
  weeklySchedules,
  appointments,
  currentUser,
  onBookAppointment,
  onNavigateToPortal
}: StudentBookingProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Calculate day of week for selected date
  const getDayOfWeek = (dateString: string): number => {
    if (!dateString) return -1;
    const date = new Date(dateString);
    return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const dayOfWeekNumber = selectedDate ? getDayOfWeek(selectedDate) : -1;

  // Check if weekend (Friday/Saturday)
  const isWeekend = dayOfWeekNumber === 5 || dayOfWeekNumber === 6;

  // Get active slots for the selected day of the week
  const activeSlotsForDay = weeklySchedules.filter(
    (slot) => slot.dayOfWeek === dayOfWeekNumber && slot.isActive
  );

  // For a selected date and slot, calculate how many confirmed+pending appointments exist
  const getBookingCount = (date: string, slotTime: string): number => {
    return appointments.filter(
      (apt) => apt.date === date && apt.timeSlot === slotTime && apt.status !== 'cancelled'
    ).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser) {
      setErrorMessage(t.needLoginToBook);
      return;
    }

    if (currentUser.role !== 'student') {
      setErrorMessage(isRtl ? 'عذراً، وظيفة حجز المواعيد مخصصة للطلاب فقط.' : 'Sorry, only students can book appointments.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage(isRtl ? 'يرجى تشخيص تاريخ المقابلة أولاً.' : 'Please select a visit date first.');
      return;
    }

    if (isWeekend) {
      setErrorMessage(t.outOfRange);
      return;
    }

    if (!selectedSlot) {
      setErrorMessage(isRtl ? 'يرجى تحديد فترة زمنية من القائمة المتاحة.' : 'Please pick an active time slot.');
      return;
    }

    // Prevent booking more than one appointment on the same day
    const hasExistingBookingOnDay = appointments.some(
      (apt) =>
        apt.studentId === currentUser.id &&
        apt.date === selectedDate &&
        apt.status !== 'cancelled'
    );

    if (hasExistingBookingOnDay) {
      setErrorMessage(
        isRtl
          ? 'عذراً، لا يسمح بحجز أكثر من موعد واحد في نفس اليوم.'
          : 'Sorry, you cannot book more than one appointment on the same day.'
      );
      return;
    }

    if (!reason.trim()) {
      setErrorMessage(isRtl ? 'يرجى كتابة سبب المقابلة ليعرف المدير غرض الزيارة.' : 'Please describe the reason for your visit.');
      return;
    }

    onBookAppointment(selectedDate, selectedSlot, reason);
    setSuccessMessage(t.bookingCreatedSuccess);
    
    // Clear form fields
    setSelectedSlot('');
    setReason('');
  };

  // Get standard date string for today and tomorrow to limit datepicker
  const getLimits = () => {
    const today = new Date();
    const nextTwoWeeks = new Date();
    nextTwoWeeks.setDate(today.getDate() + 21); // Allow booking up to 3 weeks ahead
    
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      min: formatDate(today),
      max: formatDate(nextTwoWeeks)
    };
  };

  const limits = getLimits();

  return (
    <div className="space-y-8 animate-fade-in theme-transition">
      {/* Intro Hero Section - Sleek Premium UI/UX Redesign */}
      <div className={`p-8 md:p-10 rounded-3xl relative overflow-hidden border transition-all duration-350 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/30 border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
          : 'bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-slate-50 border-slate-200/60 shadow-[0_8px_30px_rgba(226,232,240,0.35)]'
      }`}>
        {/* Subtle backdrop glows for premium depth */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.04] pointer-events-none">
          <CalendarIcon className="w-56 h-56" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-blue-100/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full border border-blue-500/10">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isRtl ? 'حجز ذكي ومؤكد فوري' : 'Instant Verified Queue Booking'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-850 dark:text-slate-100">
            {t.bookAppointment}
          </h2>
          <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 max-w-3xl leading-relaxed">
            {isRtl 
              ? 'أهلاً بك في البوابة الذكية للمقابلة. يتيح لك هذا النظام المتكامل تقديم طلب مقابلة مع مدير المعهد وتأشير موعدك بطريقة آمنة. يرجى اختيار اليوم وفترة الاستقبال المناسبة وكتابة غرض الزيارة بوضوح لتسهيل مراجعته واعتماده.'
              : 'Welcome to the Smart Scheduler Portal. This interface allows you to book dedicated reception slots directly with the director. Select an active date, choose your desired duration, and submit details securely.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Form - Premium Glass card */}
        <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-900/60 border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.15)]' 
            : 'bg-white border-slate-150 shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
        } space-y-6`}>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-850 dark:text-slate-100">
                {isRtl ? 'الاستمارة الإلكترونية للمقابلة' : 'Appointment Application Form'}
              </h3>
            </div>
            <span className="text-[9px] text-slate-450 font-mono font-bold bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/40 dark:border-slate-700">
              {isRtl ? 'أمن البيانات معزز' : 'AES-256 SECURED'}
            </span>
          </div>

          {!currentUser ? (
            <div className="text-center p-8 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-5">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.needLoginToBook}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isRtl 
                    ? 'يتوافق نظامنا مع بروتوكولات حماية بيانات الطلاب الأكاديمية والخصوصية الثنائية. يرجى تسجيل الدخول لحسابك لتفعيل الصلاحية.' 
                    : 'To comply with university safety protocols and digital privacy policies, you need an authorized student account.'}
                </p>
              </div>
              <button
                onClick={onNavigateToPortal}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold py-2.5 px-6 rounded-full transition-all text-xs shadow-lg shadow-blue-500/20"
              >
                <span>{t.goToLogin}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Logged in Student Details Pill */}
              <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.slice(0, 2).trim().toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                      {isRtl ? 'الحساب الطالب النشط' : 'Active Student Session'}
                    </div>
                    <div className="font-bold text-sm text-slate-850 dark:text-slate-100">{currentUser.name}</div>
                    <div className="text-xs text-slate-550 dark:text-slate-400 font-mono mt-0.5">{currentUser.email}</div>
                  </div>
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                    currentUser.isVerified 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    <CheckCircle className="w-3 h-3" />
                    <span>{currentUser.isVerified ? (isRtl ? 'هوية معتمدة' : 'Verified ID') : (isRtl ? 'بانتظار التأكيد' : 'Unconfirmed Email')}</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex gap-2.5 items-start">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex gap-3 items-start">
                  <div className="p-1 bg-emerald-500/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-850 dark:text-slate-100">{isRtl ? 'تم إرسال الطلب بنجاح!' : 'Booking Request Sent!'}</p>
                    <p className="opacity-95 mt-1 leading-relaxed text-[11px]">{successMessage}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* 1. Pick Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide">
                    {t.selectDate} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      id="booking-datepicker"
                      min={limits.min}
                      max={limits.max}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot('');
                        setErrorMessage('');
                      }}
                      className={`w-full p-3 rounded-xl border bg-transparent text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all px-4 ${
                        theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/40' : 'border-slate-200 focus:bg-slate-50/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Weekend Closed Warning */}
                {selectedDate && isWeekend && (
                  <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-xs flex gap-2.5 items-center text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{t.outOfRange}</span>
                  </div>
                )}

                {/* 2. Pick Slot */}
                {selectedDate && !isWeekend && (
                  <div className="space-y-3.5 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide">
                      {t.selectTime} <span className="text-rose-500">*</span>
                    </label>

                    {activeSlotsForDay.length === 0 ? (
                      <p className="text-xs text-amber-600 italic bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 leading-relaxed">
                        {isRtl 
                          ? 'لا توجد فترات استقبال معلنة للمدير في هذا اليوم حالياً، يرجى اختيار تاريخ آخر.' 
                          : 'No reception slots configured for this day currently, try another date.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeSlotsForDay.map((slot) => {
                          const timeString = `${slot.startTime} - ${slot.endTime}`;
                          const currentBookings = getBookingCount(selectedDate, timeString);
                          const isFull = currentBookings >= slot.maxCapacity;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={isFull}
                              onClick={() => setSelectedSlot(timeString)}
                              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex items-center justify-between group ${
                                isFull
                                  ? 'bg-slate-100/50 dark:bg-slate-950/10 border-slate-200/50 dark:border-slate-900 text-slate-400 cursor-not-allowed'
                                  : selectedSlot === timeString
                                  ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500 shadow-md'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50/30 dark:hover:bg-slate-900/40 bg-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Clock className={`w-4 h-4 ${selectedSlot === timeString ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="font-mono text-xs font-bold">{timeString}</span>
                              </div>
                              <div className="text-right text-[10px]">
                                {isFull ? (
                                  <span className="text-rose-500 font-bold px-2.5 py-0.5 bg-rose-500/10 rounded-full">{isRtl ? 'ممتلئ' : 'Full'}</span>
                                ) : (
                                  <span className="text-slate-500 dark:text-slate-300 font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-sans">
                                    {isRtl ? `المحجوز: ${currentBookings}/${slot.maxCapacity}` : `Booked: ${currentBookings}/${slot.maxCapacity}`}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Reason for Visit */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide">
                    {t.reasonForVisit} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.reasonPlaceholder}
                    className={`w-full p-4 rounded-2xl border bg-transparent text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none leading-relaxed transition-all ${
                      theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/20' : 'border-slate-200 focus:bg-slate-50/20'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button - Elevated Custom Shadow */}
              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold rounded-full transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{t.clickToBook}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Dynamic Scheduler Side Panel - SaaS aesthetic */}
        <div className="space-y-6">
          {/* Working Hours Card */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
          } shadow-sm space-y-4`}>
            <div className="flex items-center gap-2.5 pb-1">
              <div className="p-1.5 bg-blue-500/15 text-blue-600 rounded-lg">
                <CalendarIcon className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                {isRtl ? 'أيام وساعات العمل الرسمية' : 'Institute Office Hours'}
              </h4>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed border-b border-slate-100 dark:border-slate-850 pb-4 font-medium">
              {isRtl 
                ? 'يستقبل مدير المعهد الطلاب في أيام العمل الرسمية من الأحد إلى الخميس، بناء على المواعيد المعتمدة والأنصبة المتاحة للجدولة الأكاديمية.'
                : 'The director welcomes student receptions during standard working days. Appointments require virtual identity validations before final scheduler locks.'}
            </p>
            
            <div className="text-xs space-y-3 font-sans font-medium">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="font-bold">{t.sunday} - {t.thursday}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-100/40 dark:bg-blue-900/20 px-2.5 py-1 rounded">
                  09:00 AM - 03:00 PM
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{t.friday} - {t.saturday}</span>
                <span className="italic text-rose-500 text-[10px] font-bold bg-rose-500/10 px-2.5 py-1 rounded">
                  {isRtl ? 'مغلق (نهاية الأسبوع)' : 'Closed (Weekend)'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
          } shadow-sm space-y-3`}>
            <div className="flex gap-3 items-start">
              <div className="p-1 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                  {isRtl ? 'بروتوكول تفعيل المواعيد تلقائياً' : 'Two-Step Verification Loop'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  {isRtl
                    ? 'بعد تقديم طلبك، سنقوم فوراً بإرسال رسالة بريد إلكتروني تحتوي على زر تفعيل المقابلة. يجب النقر على الرابط لتأكيد الموعد وإدراجه في جدول المدير رسمياً.'
                    : 'Once scheduled, a secure token verification payload is sent to your email. Click confirm inside the Virtual student box below to validate and register.'}
                </p>
              </div>
            </div>
          </div>

          {/* GDPR & Security Pulse Box - Dark Premium Accent */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 border border-slate-800 shadow-xl shadow-slate-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h5 className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                {isRtl ? 'مكافحة السبام وحماية الخصوصية' : 'Anti-Spam & GDPR Safeguards'}
              </h5>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {isRtl 
                ? 'يقتصر تسجيل الحصص على حسابات الطلبة الرسمية الموثقة برقم الهاتف والبريد الأكاديمي، بما يضمن عدم شغل الفترات عشوائياً وتفادي هجمات Denial of Wallet أو إغراق بريد المعهد برزم عشوائية.'
                : 'Scheduler limits entries based on college IDs and mobile SMS tags. This protects scheduling assets against malicious flooding or automated sweeps.'}
            </p>

            <div className="flex items-center gap-2.5 pt-3 border-t border-slate-800 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-450 animate-pulse" />
              <span>{isRtl ? 'قاعدة البيانات آمنة بالكامل' : 'Encryption Channel is Live'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
