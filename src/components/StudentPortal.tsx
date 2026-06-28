import React, { useState } from 'react';
import { Lang, Theme, Appointment, User, UserRole } from '../types';
import { translations } from '../translations';
import { 
  User as UserIcon, LogIn, UserPlus, Mail, Phone, Lock, ChevronRight, 
  AlertCircle, CheckCircle, Clock, Info, ShieldAlert, LogOut, ShieldCheck 
} from 'lucide-react';

interface StudentPortalProps {
  lang: Lang;
  theme: Theme;
  currentUser: User | null;
  appointments: Appointment[];
  onLogin: (email: string, role: UserRole, password?: string) => boolean;
  onRegister: (name: string, email: string, phone: string, password?: string) => void;
  onLogout: () => void;
  onCancelAppointment: (appointmentId: string) => void;
  onVerifyEmail: (email: string) => void;
  onUpdateProfile: (name: string, phone: string, password?: string) => void;
}

export default function StudentPortal({
  lang,
  theme,
  currentUser,
  appointments,
  onLogin,
  onRegister,
  onLogout,
  onCancelAppointment,
  onVerifyEmail,
  onUpdateProfile
}: StudentPortalProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  // State
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState<string>(currentUser?.phone || '');
  const [editPassword, setEditPassword] = useState<string>('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  const startEditing = () => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone);
      setEditPassword('');
      setIsEditingProfile(true);
      setProfileSuccessMsg('');
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      setProfileSuccessMsg(isRtl ? 'الاسم لا يمكن أن يكون فارغاً.' : 'Name is required.');
      return;
    }
    onUpdateProfile(editName.trim(), editPhone.trim(), editPassword.trim() || undefined);
    setProfileSuccessMsg(isRtl ? '✓ تم حفظ التعديلات بنجاح!' : '✓ Profile updated!');
    setTimeout(() => {
      setProfileSuccessMsg('');
      setIsEditingProfile(false);
    }, 2000);
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email.');
      return;
    }

    const isDirector = email.toLowerCase().trim() === 'director@institute.edu.sa';
    const role: UserRole = isDirector ? 'director' : 'student';

    const success = onLogin(email.trim(), role, password);
    if (!success) {
      setErrorMessage(
        isRtl 
          ? 'عذراً! لم نعثر على حساب بهذا البريد وكلمة المرور المسجلة.' 
          : 'Invalid credentials. Please verify your email and password.'
      );
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid academic email.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(isRtl ? 'يرجى إدخال رقم جوالك لتلقي التنبيهات.' : 'Please enter your phone number.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage(isRtl ? 'يرجى إدخال كلمة مرور بطول 4 خانات على الأقل.' : 'Password must be at least 4 characters.');
      return;
    }

    onRegister(name.trim(), email.trim(), phone.trim(), password);
    setSuccessMessage(isRtl ? 'تم إنشاء الحساب بنجاح! يرجى النقر على رابط التفعيل في صندوق البريد الجامعي الموضح أدناه.' : 'Account registered! Please click the activation link in the Student Virtual Inbox at the bottom of the page.');
    
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setIsRegistering(false);
  };

  // Filter appointments for active student
  const studentAppointments = currentUser
    ? appointments.filter((apt) => apt.studentEmail.toLowerCase() === currentUser.email.toLowerCase())
    : [];

  return (
    <div className="space-y-8 animate-fade-in theme-transition">
      {currentUser ? (
        // Logged in View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Summary Card */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80 shadow-md' : 'bg-white border-slate-150 shadow-sm'
          } space-y-6 h-fit`}>
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/10 text-blue-600 dark:text-blue-400 p-3 rounded-2xl shrink-0">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1 text-[9px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                  <span>{currentUser.role === 'director' ? t.director : t.student}</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100 truncate">{currentUser.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate leading-none">{currentUser.email}</p>
              </div>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-455 dark:text-slate-400 block uppercase tracking-wider">
                    {isRtl ? 'الاسم الجديد للمستخدم:' : 'New Display Name:'}
                  </label>
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
                  <label className="text-[10px] font-black text-slate-455 dark:text-slate-400 block uppercase tracking-wider">
                    {isRtl ? 'رقم هاتف التنبيهات:' : 'SMS Alert Phone:'}
                  </label>
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
                  <label className="text-[10px] font-black text-slate-455 dark:text-slate-400 block uppercase tracking-wider">
                    {isRtl ? 'كلمة المرور الجديدة:' : 'New Password:'}
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={isRtl ? 'أدخل كلمة مرور جديدة' : 'Type new password'}
                    className={`w-full text-xs p-2.5 rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                      theme === 'dark' ? 'border-slate-800 text-slate-100 focus:bg-slate-950/20' : 'border-slate-200 text-slate-800 focus:bg-slate-50/20'
                    }`}
                  />
                </div>
                
                {profileSuccessMsg && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{profileSuccessMsg}</p>
                )}
                
                <div className="flex gap-2.5 pt-1.5">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-97 text-white text-[11px] font-extrabold py-2 px-3 rounded-xl transition"
                  >
                    {isRtl ? 'حفظ التعديل' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 text-[11px] font-bold py-2 px-3 rounded-xl transition"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3 text-xs text-slate-650 dark:text-slate-300 font-medium">
                  <div className="flex justify-between">
                    <span>{isRtl ? 'هاتف التنبيهات SMS:' : 'SMS Alert Contact:'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{currentUser.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isRtl ? 'حالة الحساب:' : 'Account Status:'}</span>
                    <span>
                      {currentUser.isVerified ? (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                          {isRtl ? 'نشط ومعتمد' : 'Verified & Active'}
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/10">
                          {isRtl ? 'معلق البريد' : 'Unconfirmed'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startEditing}
                  className="w-full text-xs py-2.5 bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-200 font-bold rounded-xl transition border border-slate-200/30 dark:border-slate-800"
                >
                  {isRtl ? 'تعديل بيانات الحساب ✎' : 'Edit Account Info ✎'}
                </button>
              </>
            )}

            {!currentUser.isVerified && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl space-y-3">
                <div className="flex gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold items-center">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                  <span>{isRtl ? 'تفعيل البريد الأكاديمي معلق' : 'Academic Verification Pending'}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                  {isRtl 
                    ? 'لكي تتمكن من حجز المقابلات وتفعيل الموعد، يرجى النزول لأسفل الصفحة (صندوق البريد الافتراضي) واضغط على زر "تأكيد بريدك" لتفعيل حسابك تلقائياً.'
                    : 'Scroll to the Student Virtual Inbox below and click "Confirm Account" to unlock full scheduling capabilities.'}
                </p>
                <button
                  onClick={() => onVerifyEmail(currentUser.email)}
                  className="w-full text-[10px] font-black bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl transition shadow-xs"
                >
                  {isRtl ? 'محاكاة التفعيل البريدي التلقائي' : 'Automate verification code'}
                </button>
              </div>
            )}

            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 border border-rose-500/15 text-rose-600 dark:text-rose-450 hover:bg-rose-500/5 transition text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>

          {/* User Appointments Track Panel */}
          <div className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80 shadow-md' : 'bg-white border-slate-150 shadow-sm'
          } space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-850 dark:text-slate-100">
                  {t.recentAppointments}
                </h3>
              </div>
              <span className="bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-mono font-black">
                {studentAppointments.length}
              </span>
            </div>

            {studentAppointments.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-3">
                <Clock className="w-14 h-14 mx-auto opacity-20 text-slate-500" />
                <p className="font-bold">{t.noAppointmentsYet}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentAppointments.map((apt) => {
                  const statusColors = {
                    pending_email: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    confirmed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                    completed: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                  };

                  return (
                    <div
                      key={apt.id}
                      className={`p-5 rounded-2xl border transition-all duration-250 ${
                        theme === 'dark' ? 'bg-slate-950/40 border-slate-850/80' : 'bg-slate-50/50 border-slate-150/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                            {apt.id}
                          </span>
                          <span className="text-slate-400 text-[10px] font-medium font-sans">
                            {new Date(apt.createdAt).toLocaleString(isRtl ? 'ar' : 'en')}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${statusColors[apt.status]}`}>
                          {t[apt.status]}
                        </span>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 text-xs p-3.5 rounded-xl border my-3 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'
                      }`}>
                        <div>
                          <div className="text-slate-400 text-[9px] font-bold uppercase">{t.date}</div>
                          <div className="font-black text-slate-800 dark:text-slate-100 mt-0.5">{apt.date}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px] font-bold uppercase">{t.time}</div>
                          <div className="font-black text-slate-800 dark:text-slate-100 mt-0.5">{apt.timeSlot}</div>
                        </div>
                      </div>

                      <div className={`text-xs p-3.5 rounded-xl my-3 leading-relaxed border ${
                        theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/30 border-slate-100'
                      }`}>
                        <span className="font-black block text-[9px] text-slate-400 uppercase tracking-wide mb-1">{isRtl ? 'غرض المقابلة:' : 'Reason for entry:'}</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{apt.reason}</p>
                      </div>

                      {apt.managerNotes && (
                        <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs space-y-1.5 my-3">
                          <span className="font-extrabold text-blue-600 block text-[9px] uppercase tracking-wider">
                            {isRtl ? 'توجيه وملاحظات المدير الإداري:' : 'Director Executive Notes:'}
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 italic font-medium">“{apt.managerNotes}”</p>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2.5 justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-850 text-xs">
                        {apt.status === 'pending_email' ? (
                          <div className="flex gap-2 items-center text-amber-600 bg-amber-500/5 p-2 rounded-xl text-[11px] font-semibold border border-amber-500/10">
                            <Info className="w-4 h-4 shrink-0 text-amber-500" />
                            <span>
                              {isRtl 
                                ? 'يرجى تفعيل الموعد من صندوق البريد أسفل الصفحة للتأكيد.' 
                                : 'Awaiting confirmation in virtual email sandbox below.'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 items-center text-emerald-600 bg-emerald-500/5 p-2 rounded-xl text-[11px] font-bold border border-emerald-500/10">
                            <CheckCircle className="w-4 h-4" />
                            <span>{isRtl ? 'الموعد مجدول وفعال' : 'Session is Scheduled'}</span>
                          </div>
                        )}

                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => onCancelAppointment(apt.id)}
                            className="bg-rose-600 hover:bg-rose-700 active:scale-97 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                          >
                            {isRtl ? 'إلغاء الموعد' : 'Cancel appointment'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Login / Register Form View - Premium Modern SaaS Glass Card
        <div className="max-w-md mx-auto">
          <div className={`p-8 sm:p-10 rounded-3xl border transition-all duration-350 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
              : 'bg-white border-slate-150 shadow-[0_15px_40px_rgba(148,163,184,0.12)]'
          } space-y-6 relative overflow-hidden`}>
            
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-2.5">
              <div className="mx-auto w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
                {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              </div>
              <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
                {isRegistering ? t.registerTitle : t.loginTitle}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {isRtl 
                  ? 'بوابة المعهد الإلكترونية الموحدة لترتيب المقابلات الأكاديمية' 
                  : 'Official portal for verifying student identities and bookings'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex gap-2 items-start animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex gap-2.5 items-start animate-fade-in">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 mb-1">{t.name}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'سلطان علي الحربي' : 'John Doe'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                        theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/20 text-slate-100' : 'border-slate-200 focus:bg-slate-50/20 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 mb-1">{t.email}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder={
                      isRegistering 
                        ? (isRtl ? 'user@institute.edu.sa' : 'student@edu.sa') 
                        : (isRtl ? 'director@institute.edu.sa' : 'Your address')
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                      theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/20 text-slate-100' : 'border-slate-200 focus:bg-slate-50/20 text-slate-800'
                    }`}
                  />
                </div>
                {!isRegistering && (
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-1 block px-1">
                    🚀 {isRtl ? 'للوج كمدير استخدم: director@institute.edu.sa' : 'To log as director use: director@institute.edu.sa'}
                  </span>
                )}
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 mb-1">{t.phone}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="+96650XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                        theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/20 text-slate-100' : 'border-slate-200 focus:bg-slate-50/20 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-455 dark:text-slate-400 mb-1">{t.password}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-transparent focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                      theme === 'dark' ? 'border-slate-800 focus:bg-slate-950/20 text-slate-100' : 'border-slate-200 focus:bg-slate-50/20 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold rounded-full transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 text-xs flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <span>{isRegistering ? t.registerBtn : t.loginBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs pt-2">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold"
              >
                {isRegistering ? t.haveAccount : t.noAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
