import React, { useState } from 'react';
import { Lang, Theme, WeeklySchedule, Appointment, User } from '../types';
import { translations } from '../translations';
import { Calendar as CalendarIcon, Clock, Send, AlertTriangle, CheckCircle, ShieldAlert, FileText, Sparkles } from 'lucide-react';

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
    return date.getDay(); // 0 = Sunday, 1 = Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
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

    if (!reason.trim()) {
      setErrorMessage(isRtl ? 'يرجى كتابة سبب المقابلة ليعرف المدير غرض الزيارة.' : 'Please describe the reason for your visit.');
      return;
    }

    // Call book handler
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
    <div className="space-y-6">
      {/* Intro Hero Section - Sleek Premium */}
      <div className={`p-8 rounded-3xl relative overflow-hidden border transition-all duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-slate-800' : 'bg-gradient-to-br from-blue-50/60 to-indigo-50/20 border-slate-200'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <CalendarIcon className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-500/10">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>{isRtl ? 'حجز موثق في ثوانٍ معدودة' : 'Instant Verified Booking'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-850 dark:text-slate-100">{t.bookAppointment}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 max-w-2xl leading-relaxed">
            {isRtl 
              ? 'أهلاً بك عزيزي الطالب. يتيح لك هذا النظام المتكامل تقديم طلب مقابلة مع مدير المعهد وتأشير موعدك بطريقة آمنة. يرجى اختيار اليوم وفترة الاستقبال المناسبة وكتابة غرض الزيارة بوضوح لتسهيل مراجعته واعتماده.'
              : 'Welcome, dear student. This electronic system allows you to submit an official meeting proposal with the Institute Director. Register your email, reserve an open timing slot, and state your inquiries clearly for fast processing.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Form - Sleek 3xl card */}
        <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-6`}>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4 flex items-center justify-between">
            <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{isRtl ? 'الاستمارة الإلكترونية للمقابلة' : 'Appointment Application Form'}</span>
            </h3>
            <span className="text-[10px] text-slate-450 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {isRtl ? 'شفرة آمنة' : 'Secure AES-256'}
            </span>
          </div>

          {!currentUser ? (
            <div className="text-center p-8 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/10 rounded-2xl space-y-4">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.needLoginToBook}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isRtl ? 'يتوافق نظامنا مع بروتوكولات حماية بيانات الطلاب الأكاديمية.' : 'Our platform respects strict student identity verifications.'}</p>
              </div>
              <button
                onClick={onNavigateToPortal}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-full transition text-xs shadow-lg shadow-blue-500/20"
              >
                <span>{t.goToLogin}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logged in Student Details Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{isRtl ? 'حساب الطالب النشط' : 'Active Student Client'}</div>
                  <div className="font-bold text-sm text-slate-850 dark:text-slate-100">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">{currentUser.email}</div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    <span>{currentUser.isVerified ? (isRtl ? 'حساب مؤكد' : 'Verified ID') : (isRtl ? 'بانتظار تأكيد البريد' : 'Unconfirmed Email')}</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-xs flex gap-2 items-start animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex gap-2 items-start">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <p className="font-bold">{isRtl ? 'تم وضع الطلب بنجاح!' : 'Request Sent!'}</p>
                    <p className="opacity-90 mt-1">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Form Input fields */}
              <div className="space-y-5">
                {/* 1. Pick Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    {t.selectDate} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={limits.min}
                      max={limits.max}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot('');
                        setErrorMessage('');
                      }}
                      className="w-full p-2.5 rounded-full border border-slate-300 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all px-4"
                    />
                  </div>
                </div>

                {/* Weekend Closed Warning */}
                {selectedDate && isWeekend && (
                  <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-xs flex gap-2 items-center text-red-650 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{t.outOfRange}</span>
                  </div>
                )}

                {/* 2. Pick Slot */}
                {selectedDate && !isWeekend && (
                  <div className="space-y-3 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      {t.selectTime} <span className="text-red-500">*</span>
                    </label>

                    {activeSlotsForDay.length === 0 ? (
                      <p className="text-xs text-amber-600 italic bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10">
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
                              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex items-center justify-between ${
                                isFull
                                  ? 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-400 cursor-not-allowed'
                                  : selectedSlot === timeString
                                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30 shadow-md'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50/40 dark:hover:bg-slate-900/40 bg-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${selectedSlot === timeString ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="font-mono text-xs font-bold">{timeString}</span>
                              </div>
                              <div className="text-right text-[10px]">
                                {isFull ? (
                                  <span className="text-red-500 font-bold px-2.5 py-0.5 bg-red-100/50 dark:bg-red-950/30 rounded-full">{isRtl ? 'ممتلئ' : 'Full'}</span>
                                ) : (
                                  <span className="text-slate-500 dark:text-slate-300 font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded font-sans">
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
                <div>
                  <label className="block text-xs font-bold text-slate-450 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    {t.reasonForVisit} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t.reasonPlaceholder}
                    className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none leading-relaxed transition-all"
                  />
                </div>
              </div>

              {/* Submit Trigger - Sleek signature blue active button with shadow */}
              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{t.clickToBook}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Dynamic Scheduler Side Panel - Sleek rounded cards */}
        <div className="space-y-6">
          {/* Working Days Card */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>{isRtl ? 'أيام وساعات العمل الرسمية' : 'Institute Office Hours'}</span>
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-850 pb-3">
              {isRtl 
                ? 'يستقبل مدير المعهد الطلاب في أيام العمل الرسمية من الأحد إلى الخميس، بناء على المواعيد المعتمدة والأنصبة المتاحة للجدولة الأكاديمية.'
                : 'The director welcomes students during official days from Sunday to Thursday based on verified digital appointment queues.'}
            </div>
            
            {/* Days list */}
            <div className="text-xs space-y-2.5 font-sans">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-bold">
                <span className="font-semibold">{t.sunday} - {t.thursday}</span>
                <span className="font-bold text-blue-600 font-mono bg-blue-100/50 dark:bg-blue-900/20 px-2 py-0.5 rounded">09:00 AM - 03:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-450">
                <span>{t.friday} - {t.saturday}</span>
                <span className="italic text-red-500 text-[10px] font-bold bg-red-100/50 dark:bg-red-950/20 px-2 py-0.5 rounded">{isRtl ? 'مغلق (عطلة نهاية الأسبوع)' : 'Closed (Weekend)'}</span>
              </div>
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-2`}>
            <div className="flex gap-2 text-slate-705 dark:text-slate-200 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isRtl ? 'بروتوكول التحقق الثنائي (Two-Factor Verify):' : 'Bilingual Verification Safeguard:'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isRtl
                    ? 'بعد تقديم طلبك، سنقوم فوراً بإرسال رسالة بريد إلكتروني تحتوي على رابط تأكيد المقابلة. يجب النقر على الرابط لتأكيد الموعد وإدراجه في جدول المدير، لتجنب إلغاء الحجز تلقائياً.'
                    : 'Once you trigger a booking, a bilingual transaction validation notification is shot to your inbox. Tap the button to verify identity and assert slot registry in the director\'s database.'}
                </p>
              </div>
            </div>
          </div>

          {/* GDPR Compliance Card - Sleek dark layout matching the server status in the theme */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-3 border border-slate-800 shadow-xl shadow-slate-900/10">
            <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{isRtl ? 'مكافحة الهجمات وحماية البيانات' : 'Anti-Spam & GDPR Safeguards'}</h5>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {isRtl 
                ? 'يقتصر تسجيل الحصص على حسابات الطلبة الرسمية الموثقة برقم الهاتف والبريد الأكاديمي، بما يضمن عدم شغل الفترات عشوائياً وتفادي هجمات Denial of Wallet أو إغراق بريد المعهد برزم عشوائية.'
                : 'Booking access is mathematically rate-limited to authenticated college credentials preventing wallet-draining API sweeps or schedule spamming.'}
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>{isRtl ? 'قاعدة البيانات محمية ومؤمنة بالكامل' : 'Database fully encrypted'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
